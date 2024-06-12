package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.service.RegistrationService;
import ru.kata.spring.boot_security.demo.service.UserService;
import ru.kata.spring.boot_security.demo.util.UserValidator;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final RegistrationService registrationService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private final UserValidator userValidator;

    @Autowired
    public AdminController(UserService userService, RegistrationService registrationService, RoleRepository roleRepository, PasswordEncoder passwordEncoder, UserValidator userValidator) {
        this.userService = userService;
        this.registrationService = registrationService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userValidator = userValidator;
    }


    @GetMapping()
    public String index(Model model) {
        List<User> users = userService.findAll();
        User user = new User();
        model.addAttribute("user", user);
        model.addAttribute("users", users);
        return "admin";
    }


    @PostMapping("/new")
    public String newUser(@ModelAttribute("user") @Valid User user, BindingResult bindingResult) {
        userValidator.validate(user, bindingResult);
        if(bindingResult.hasErrors()){
            return "profile";
        }
        registrationService.register(user);
        return "redirect:/profile";
    }


    @PostMapping("/edit")
    public String update(HttpServletRequest request, @RequestParam(value = "userId", required = false) Integer userId) {
        User user = userService.findById(userId).get();
        String password = request.getParameter("password");
        int role = Integer.parseInt(request.getParameter("role"));

        user.setFirstName(request.getParameter("first-name"));
        user.setLastName(request.getParameter("last-name"));
        user.setAge(Integer.parseInt(request.getParameter("age")));
        user.setEmail(request.getParameter("email"));

        if(!password.isEmpty()){
            user.setPassword(passwordEncoder.encode(password));
        }

        if(user.getRoles().contains(roleRepository.getById(role))){
        } else {
            Role role1 = roleRepository.findById(role).get();
            user.getRoles().add(role1);
            if(role == 1){
                user.getRoles().remove(roleRepository.findById(2).get());
            } else {
                user.getRoles().remove(roleRepository.findById(1).get());
            }
        }

        userService.update(userId, user);
        return "redirect:/profile";
    }


    @PostMapping("/delete")
    public String delete(@RequestParam(value = "userId", required = false) Integer userId) {
        userService.deleteById(userId);
        return "redirect:/profile";
    }

}
