# Copilot Instructions for This Angular Project

## Architecture

Always follow the existing project architecture.

Maintain the same structure, patterns, and organization already used in this project.

Do not introduce new architectural patterns different from the current project structure.

## Angular version

Always use Angular 17+ modern syntax and features.

## Modern Angular Syntax

Always prefer the latest Angular syntax and modern APIs available in Angular 17+.

Use modern patterns for:

component inputs and outputs

dependency injection

state management

routing

and template control flow

Prefer signals and modern Angular state management approaches instead of older patterns.

## Type Definitions and Classes

Do not define enums, interfaces, types, or classes inside components.

Always place each enum, interface, type, or class in its own separate file.

Follow consistent naming conventions for these files.

Examples:

user.model.ts
login-request.model.ts
login-response.model.ts
user-role.enum.ts
