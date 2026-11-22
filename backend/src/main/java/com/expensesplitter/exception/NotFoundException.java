package com.expensesplitter.exception;

/** Thrown when a resource doesn't exist or the caller isn't allowed to know it exists. Maps to 404. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
