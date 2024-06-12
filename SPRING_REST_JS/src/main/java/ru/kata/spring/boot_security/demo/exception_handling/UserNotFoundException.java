package ru.kata.spring.boot_security.demo.exception_handling;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(String message) {
        super(message);
    }
}
