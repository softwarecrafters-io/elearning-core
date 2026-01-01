# plan

Create a development plan following TDD and architecture practices.

## Before creating the plan

**Review these rules**:
- @.cursor/rules/practices-tdd.mdc
- @.cursor/rules/practices-testing.mdc
- @.cursor/rules/practices-git-strategy.mdc
- @.cursor/rules/architecture-domain-value-objects.mdc
- @.cursor/rules/architecture-domain-entities.mdc
- @.cursor/rules/architecture-domain-repositories.mdc
- @.cursor/rules/architecture-domain-services.mdc
- @.cursor/rules/architecture-application-usecases.mdc
- @.cursor/rules/architecture-application-dtos.mdc
- @.cursor/rules/architecture-infrastructure-http.mdc
- @.cursor/rules/architecture-infrastructure-factory.mdc

## Plan structure

1. **Understand the requirement**: Ask clarifying questions if needed
2. **Identify layers**: Which layers are involved (Domain, Application, Infrastructure)?
3. **Define test cases**: List cases from simplest to most complex (TDD)
4. **Development order**: Inside-out (Domain → UseCase → Infrastructure)
5. **Acceptance criteria**: What defines "done"?

## Plan format

```markdown
# [Feature Name]

## Requirement
Brief description of what needs to be built.

## Layers involved
- [ ] Domain (entities, VOs, services, repositories)
- [ ] Application (use cases, DTOs)
- [ ] Infrastructure (adapters, HTTP)

## Test cases (ordered simple → complex)
1. ...
2. ...

## Development order
1. Domain: ...
2. Application: ...
3. Infrastructure: ...

## Acceptance criteria
- [ ] All tests pass
- [ ] Code follows architecture rules
- [ ] PR created and reviewed
```

## After completing the plan

1. Create feature branch: `git checkout -b feat/[feature-name]`
2. Develop following TDD (commit on each green test)
3. When done, use `/pr-create` to push and create PR

