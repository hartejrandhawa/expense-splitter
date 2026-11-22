package com.expensesplitter.exception;

/** Thrown when the caller can see a resource but isn't allowed to perform the action. Maps to 403. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
