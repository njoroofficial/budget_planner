# Requirements Document

## Introduction

The Budget Planner is a personal finance management application designed for Kenyan users to track income, statutory deductions, and expenditures. The system calculates net pay after applying Kenyan tax laws (SHA, PAYEE, Housing Levy) and helps users organize their monthly budget across categories such as rent, transport, savings, food, and other expenses.

## Glossary

- **Budget Planner**: The personal finance management application
- **Gross Pay**: Total salary before any deductions (KSh 40,000)
- **Net Pay**: Salary after all statutory deductions (approximately KSh 33,000)
- **SHA**: Social Health Authority deduction (Kenyan statutory health insurance)
- **PAYEE**: Pay As You Earn tax (Kenyan income tax)
- **Housing Levy**: Kenyan statutory housing fund contribution
- **Budget Category**: A classification for expenses (e.g., rent, transport, savings, food)
- **User**: The individual managing their personal finances through the application

## Requirements

### Requirement 1

**User Story:** As a User, I want to input my gross pay, so that the system can calculate my net pay after statutory deductions

#### Acceptance Criteria

1. THE Budget Planner SHALL accept gross pay input as a numeric value in Kenyan Shillings
2. WHEN the User enters gross pay, THE Budget Planner SHALL calculate SHA deduction according to current Kenyan law
3. WHEN the User enters gross pay, THE Budget Planner SHALL calculate PAYEE deduction according to current Kenyan tax brackets
4. WHEN the User enters gross pay, THE Budget Planner SHALL calculate Housing Levy deduction according to current Kenyan law
5. WHEN all deductions are calculated, THE Budget Planner SHALL display the net pay amount

### Requirement 2

**User Story:** As a User, I want to view a breakdown of all my statutory deductions, so that I understand how my net pay is calculated

#### Acceptance Criteria

1. THE Budget Planner SHALL display SHA deduction amount separately
2. THE Budget Planner SHALL display PAYEE deduction amount separately
3. THE Budget Planner SHALL display Housing Levy deduction amount separately
4. THE Budget Planner SHALL display total deductions as the sum of all statutory deductions
5. THE Budget Planner SHALL display the calculation formula for each deduction type

### Requirement 3

**User Story:** As a User, I want to create budget categories for my expenses, so that I can organize my spending

#### Acceptance Criteria

1. THE Budget Planner SHALL provide default budget categories including rent, transport, savings, and food
2. THE Budget Planner SHALL allow the User to add custom budget categories
3. WHEN the User creates a budget category, THE Budget Planner SHALL require a category name
4. THE Budget Planner SHALL allow the User to assign a planned amount to each budget category
5. THE Budget Planner SHALL prevent duplicate category names

### Requirement 4

**User Story:** As a User, I want to allocate my net pay across different budget categories, so that I can plan my monthly spending

#### Acceptance Criteria

1. THE Budget Planner SHALL allow the User to assign monetary amounts to each budget category
2. WHEN the User allocates funds, THE Budget Planner SHALL calculate the total allocated amount
3. THE Budget Planner SHALL display remaining unallocated funds from net pay
4. IF total allocated amount exceeds net pay, THEN THE Budget Planner SHALL display a warning message
5. THE Budget Planner SHALL allow the User to modify allocated amounts at any time

### Requirement 5

**User Story:** As a User, I want to track actual expenses against my budget categories, so that I can monitor my spending

#### Acceptance Criteria

1. THE Budget Planner SHALL allow the User to record actual expenses with amount, category, and date
2. WHEN an expense is recorded, THE Budget Planner SHALL update the spent amount for that category
3. THE Budget Planner SHALL display remaining budget for each category
4. THE Budget Planner SHALL calculate the difference between planned and actual spending per category
5. IF actual spending exceeds planned budget for a category, THEN THE Budget Planner SHALL highlight that category

### Requirement 6

**User Story:** As a User, I want to view a summary of my financial situation, so that I can understand my overall budget health

#### Acceptance Criteria

1. THE Budget Planner SHALL display total income (gross pay and net pay)
2. THE Budget Planner SHALL display total planned budget across all categories
3. THE Budget Planner SHALL display total actual spending across all categories
4. THE Budget Planner SHALL display total savings (net pay minus actual spending)
5. THE Budget Planner SHALL calculate and display the percentage of net pay spent

### Requirement 7

**User Story:** As a User, I want to save my budget data, so that I can access it across sessions

#### Acceptance Criteria

1. WHEN the User enters or modifies data, THE Budget Planner SHALL persist the data
2. WHEN the User opens the application, THE Budget Planner SHALL load previously saved data
3. THE Budget Planner SHALL maintain data integrity during save and load operations
4. THE Budget Planner SHALL handle cases where no previous data exists
5. THE Budget Planner SHALL provide feedback when data is successfully saved
