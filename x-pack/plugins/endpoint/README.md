# Introduction

This plugin allows users to work with the Elastic Endpoint.

# Teams
We have 3 teams, each working on a different feature set.

<dl>
<dt>Data Visibility</dt>
<dd>Visualizing the data retrieved from the Elastic Endpoint.</dd>
<dt>Response</dt>
<dd>Allows the user to communicate with (and control) the Elastic Endpoint.</dd>
<dt>Management</dt>
<dd>Allows the user to deploy and configure the Elastic Endpoint.</dd>
</dl>

# Our Kibana Server
Our server provides non-RESTful HTTP APIs to the UI.

Each team has one or more APIs they maintain for their UI. Each page (or work flow, or feature) is owned by a specific team and so are the APIs that power it. APIs aren't generally shared between the teams.

We define Typescript types/interfaces that are shared between the server and client:
* Types for HTTP request query values, and HTTP PUT/POST bodies
  - Used by the client when creating a request
  - Created and validated via `@kbn/config-schema`
* Types for HTTP Response bodies
  - Used by the server when forming an HTTP Response
  - Used by the client to cast the HTTP Response

# Our UI
We use React and Redux for the UI. We put an emphasis on Redux.

Each team implements its own "Redux App". By this we mean a set of actions, a reducer, selectors, and a middleware. The Redux state for each steam consists of plain JavaScript objects, Maps, Sets, arrays, etc. No special libraries are used. But we do enforce immutability via Typescript types (search for `Immutable`.) Actions are plain JavaScript objects. There are no action creators. Actions objects are defined, generally as object literals, wherever they are dispatched. Reducers are pure functions. Nothing special there either. The middleware maintained by each team has access to various injected dependencies, for example Kibana's `core` API. The most important thing that middleware are responsible for is interacting with the server. No server access is allowed anywhere but in the middleware. Selectors are functions that take the state and return some value. Selectors form a _read-only view model_ for the Redux state. The data in state should be consider private to the reducer, and all other parts of the code should treat state as opaque, only accessing it via selectors. Selectors are created using the `reselect` library.

## Combining Each Team's Redux Apps

Each team also has a reducer. The reducers are combined using Redux's `combineReducers` function. This means that each team's reducer receives **only** their state. The reducers cannot access state from other teams.

We continue the same separation of concerns for middleware. Each team's middleware is created using a helper function called `substateMiddlewareFactory`. This helper wraps a regular middleware and causes `getState` to only return a piece of state. For each team, this piece of state is the same for their middleware as it is for their reducer.

Each team has it's own set of selectors. Just like reducers and middleware, the selectors only operate on the team's specific state. In our React code, each team has a specific version of the `useSelector` hook from `react-redux` that returns just their own state. For example: `useAlertSelector`.

Each team also has its own Redux actions. In React, each team has its own version of `useDispatch` which accepts only their own actions.

## Redux Best Practices

### We have an opinionated idea of Redux actions.

Our Redux actions are flux standard actions. We don't use action creators. Our actions are plain JavaScript objects. We have Typescript interfaces for each action type. Each team has a union type which represents all of their action types. We also have an application-wide union type which represents all of our action types.

Our actions are _records_ of a side effect having been introduced. When a user clicks a button, we might dispatch an action called <kbd>userClickedSubmitButton</kbd>. The name of the action describes the side effect that was introduced. Our actions are not commands or queries. There is no way to reject or cancel an action, it represents something that definitely happened. Our actions are created as plain JavaScript object literals. There is no associated code with an action.

When we dispatch actions, we dispatch just one at a time. If we need to respond to an action in more than one way, then more than one reducer, or more than one middleware, can respond to the same action.

### Conventions Around Actions
Our actions are named after the side effect they record. We tend to think of 3 'actors' introducing side effects. The user, the server, and the 'app'. 

If a user introduced an action, for example clicking a button, typing something, etc. we prefix the action type with 'user'. For example: "userClickedSubmitButton".

When receiving data from the server, for example via an HTTP request, we dispatch an action with the prefix "server". For example: "serverReturnedAlertDetail". The action generally contains as much of the response as possible.

When UI code choses to dispatch an action without direct user input, and without having received a response from the server, we prefix it with "app". An example would be "appBeganPollingForLatestAlertDetail". We may have none of these, so don't be surprised if you can't find any.

### Reducer Best Practices
The reducer should store normalized data based on actions. Handling actions in the reducer should be quick and simple. If any kind of calculation needs to be done, we do it in the selectors instead. In general, if something could be done in the reducer or in the selectors, always do it in the selectors.

Reducer state must be immutable. We don't use any library to help us with this (though we may in the future.) Typescript types will enforce that no reducer mutates state or actions.

## React Best Practices

* We *only* use functional components wrapped in `React.memo`.
* We use `useCallback` and `useMemo` as much as possible.
* We treat React code as a thin view layer on top of our Redux applications
  - usually, but as always "it depends"

### When not to use `useState`
We tend to use Redux a lot, and `useState` sparingly. Here are times when you should use Redux:

* If state is needed by two components, put it in Redux
* If a component needs-directionally communicate with another component, do that via Redux
* If you have state, it should probably be in Redux

So when is `useState` a good idea? For state like: "is this drop-down open or closed?" This is a good candidate because no other component needs to know if its open. No other component needs to close it. And no imperative code needs to run when the state changes. If we need to programmatically close or open a drop-down, or make an HTTP request when it opens, we'd probably want that to be in Redux.

# Testing
Most of our tests are unit tests, followed by integration tests, followed by functional tests. Tests should assert behavior that is observable by users.

## Redux testing

Since each team's Redux code is separated into 'apps' we can test each one in isolation. We can create a store that uses a team's reducer and middleware. Tests can dispatch actions and then assert that the state is correct using selectors. All of this can be done without using other teams code.

## React testing
We generally use `@testing-library/react`. We have a helper that creates the application with mocked dependencies. We can also run with middleware disabled. Since middleware is responsible for all interaction with the server, disabling it is very convenient for some types of tests.

# Sharing between teams
We want to maximize the autonomy of each team. Developers should be able to work the way they like and have fun doing so. Of course we need a maintainable code base, and we need a consistent experience for customers. So here's what to share:

* Share ideas
* Share patterns and practices
* Share tests (suites, helpers, etc.)
* Share types
* Use the same libraries
* And if you really need to, share implementations

It might sound odd to be told to de-prioritize sharing implementation code. See the Elasticsearch contributing guide for some reasoning: https://github.com/elastic/engineering/blob/master/development_constitution.md
