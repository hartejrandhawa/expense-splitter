package com.expensesplitter.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Drives the real HTTP API end to end: auth, membership checks, splitting and settling. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GroupFlowIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    String alice, bob, cara, mallory;
    String aliceToken, bobToken, caraToken, malloryToken;

    @BeforeEach
    void registerUsers() throws Exception {
        // Unique names per test, since the in-memory DB is shared across tests in the class.
        String run = UUID.randomUUID().toString().substring(0, 6);
        alice = "alice" + run; bob = "bob" + run; cara = "cara" + run; mallory = "mal" + run;
        aliceToken = register(alice);
        bobToken = register(bob);
        caraToken = register(cara);
        malloryToken = register(mallory);
    }

    @Test
    void splitAddSettleAndPayDown() throws Exception {
        long groupId = createGroup(aliceToken, "Cabin", bob, cara);

        // Alice pays $10 split 3 ways: the penny goes to someone, nothing is lost.
        call(post("/api/groups/" + groupId + "/expenses"), aliceToken, Map.of(
                "description", "Snacks", "amount", "10.00",
                "splitBetweenUsernames", List.of(alice, bob, cara)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.splits.length()").value(3));

        // Bob pays $30, exact split: cara owes 20, bob 10.
        call(post("/api/groups/" + groupId + "/expenses"), aliceToken, Map.of(
                "description", "Gas", "amount", "30", "paidByUsername", bob,
                "exactSplits", Map.of(bob, "10.00", cara, "20.00")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paidBy").value(bob));

        JsonNode balances = read(call(get("/api/groups/" + groupId + "/balances"), bobToken, null));
        assertThat(sumOf(balances, "balance")).isZero();

        JsonNode plan = read(call(get("/api/groups/" + groupId + "/settlement"), caraToken, null));
        assertThat(plan.size()).isBetween(1, 2);

        // Pay off every suggested transfer; the group should end up even.
        for (JsonNode t : plan) {
            call(post("/api/groups/" + groupId + "/payments"), caraToken, Map.of(
                    "fromUsername", t.get("from").asText(),
                    "toUsername", t.get("to").asText(),
                    "amount", t.get("amount").decimalValue()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.payment").value(true));
        }
        call(get("/api/groups/" + groupId + "/settlement"), aliceToken, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // Repayments don't count as spending.
        call(get("/api/groups/" + groupId), aliceToken, null)
                .andExpect(jsonPath("$.totalSpent").value(40.0))
                .andExpect(jsonPath("$.yourBalance").value(0.0));
    }

    @Test
    void nonMembersCannotSeeOrTouchAGroup() throws Exception {
        long groupId = createGroup(aliceToken, "Private", bob);

        call(get("/api/groups/" + groupId), malloryToken, null).andExpect(status().isNotFound());
        call(get("/api/groups/" + groupId + "/expenses"), malloryToken, null).andExpect(status().isNotFound());
        call(get("/api/groups/" + groupId + "/settlement"), malloryToken, null).andExpect(status().isNotFound());
        call(post("/api/groups/" + groupId + "/expenses"), malloryToken, Map.of(
                "description", "Sneaky", "amount", "5", "splitBetweenUsernames", List.of(alice)))
                .andExpect(status().isNotFound());

        // Members can't drag outsiders into a split either.
        call(post("/api/groups/" + groupId + "/expenses"), aliceToken, Map.of(
                "description", "Lunch", "amount", "5", "splitBetweenUsernames", List.of(alice, mallory)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(mallory + " isn't a member of this group"));
    }

    @Test
    void addMemberThenOnlyPayerOrCreatorCanDelete() throws Exception {
        long groupId = createGroup(aliceToken, "Flat", bob);

        call(post("/api/groups/" + groupId + "/members"), bobToken, Map.of("username", cara))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.members.length()").value(3));
        call(post("/api/groups/" + groupId + "/members"), bobToken, Map.of("username", cara))
                .andExpect(status().isBadRequest());

        long expenseId = read(call(post("/api/groups/" + groupId + "/expenses"), bobToken, Map.of(
                "description", "Rent", "amount", "900", "splitBetweenUsernames", List.of(alice, bob, cara))))
                .get("id").asLong();

        call(delete("/api/groups/" + groupId + "/expenses/" + expenseId), caraToken, null)
                .andExpect(status().isForbidden());
        call(delete("/api/groups/" + groupId + "/expenses/" + expenseId), aliceToken, null) // creator
                .andExpect(status().isNoContent());
        call(get("/api/groups/" + groupId + "/expenses"), bobToken, null)
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void authErrorsAreJson() throws Exception {
        call(post("/api/auth/login"), null, Map.of("username", alice, "password", "wrong-password"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid username or password"));

        call(get("/api/groups"), null, null).andExpect(status().isUnauthorized());
        call(get("/api/groups"), "not-a-real-token", null).andExpect(status().isUnauthorized());

        call(post("/api/auth/register"), null, Map.of("username", "x", "email", "bad", "password", "short"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    // --- helpers ---

    private String register(String username) throws Exception {
        JsonNode res = read(call(post("/api/auth/register"), null, Map.of(
                "username", username, "email", username + "@example.com", "password", "password123")));
        return res.get("token").asText();
    }

    private long createGroup(String token, String name, String... others) throws Exception {
        return read(call(post("/api/groups"), token, Map.of("name", name, "memberUsernames", List.of(others))))
                .get("id").asLong();
    }

    private ResultActions call(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        if (token != null) req.header("Authorization", "Bearer " + token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        return mvc.perform(req);
    }

    private JsonNode read(ResultActions result) throws Exception {
        String body = result.andReturn().getResponse().getContentAsString();
        assertThat(result.andReturn().getResponse().getStatus()).as(body).isLessThan(300);
        return json.readTree(body);
    }

    private static java.math.BigDecimal sumOf(JsonNode array, String field) {
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        for (JsonNode n : array) total = total.add(n.get(field).decimalValue());
        return total.stripTrailingZeros();
    }
}
