# Global Alert System - Testing

This document explains how to run the tests for the Global Alert System.

## Unit Tests

The unit tests validate the individual components of the alert system:

- `contexts/__tests__/alert-context.test.tsx`: Tests for the alert context
- `components/layout/__tests__/GlobalAlert.test.tsx`: Tests for the GlobalAlert component

To run these tests:

```bash
npm test
# or to watch for changes
npm run test:watch
# or to generate coverage report
npm run test:coverage
```

## Integration Tests

Integration tests verify how the alert system components work together:

- `tests/integration/alert-system.test.tsx`: Tests the AlertExample component with the alert system

To run the integration tests:

```bash
npm test tests/integration/alert-system.test.tsx
```

## End-to-End Tests

The E2E tests validate the alert system in a real browser environment:

- `tests/e2e/alert-system.spec.ts`: Tests the alert system on a demo page

To run the E2E tests:

```bash
npm run test:e2e
# or to run with UI
npm run test:e2e:ui
# or to run in debug mode
npm run test:e2e:debug
```

## Demo Page

A demo page has been created to showcase the alert system and for E2E testing purposes:

- URL: `/alert-demo`
- Implementation: `app/alert-demo/page.tsx`

Visit this page in your browser to test the alert system manually.

## Test Structure

### Unit Tests

- **Alert Context Tests**: Verify that the context correctly manages alert state, handles auto-close timers, and provides the expected API.
- **GlobalAlert Component Tests**: Verify that the component renders correctly for different alert types, handles user interactions (dismiss, hover), and manages collapse/expand behavior.

### Integration Tests

- **AlertExample Tests**: Verify that the example component correctly integrates with the alert system, showing different alerts and handling interactions.

### E2E Tests

- **Browser Tests**: Verify that the alert system works as expected in a real browser environment, including visual transitions, auto-closing, and user interactions.

## Coverage Goals

- Unit tests aim for 80%+ coverage of the alert system code
- Integration tests verify key user flows and component interactions
- E2E tests validate the system in realistic usage scenarios

To improve test coverage, focus on edge cases like:
- Handling rapid sequences of alerts
- Testing with various screen sizes
- Verifying accessibility features
