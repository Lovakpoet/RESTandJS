package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.exception_handling.UserNotFoundException;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class RESTController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public RESTController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<>(userService.findAll(), HttpStatus.OK);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getOne(@PathVariable("id") int id) {
        Optional<User> user;
        if((user = userService.findById(id)).isEmpty()){
            throw new UserNotFoundException("User with id "+id+" not found in DB");
        }
        return new ResponseEntity<>(user.get(), HttpStatus.OK);
    }

    @PostMapping("/users")
    public ResponseEntity<User> create(@RequestBody User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return new ResponseEntity<>(userService.save(user), HttpStatus.OK);
    }

    @PutMapping("/users")
    public ResponseEntity<User> update(@RequestBody User user){
        if(!user.getPassword().isEmpty()){
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(userService.findById(user.getId()).get().getPassword());
        }
        return new ResponseEntity<>(userService.update(user.getId(), user), HttpStatus.OK);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> delete(@PathVariable("id") int id){
        if(userService.findById(id).isEmpty()){
            throw new UserNotFoundException("User with id "+id+" not found in DB");
        }
        userService.deleteById(id);
        return new ResponseEntity<>("User with id "+id+" was deleted", HttpStatus.OK);
    }
}
