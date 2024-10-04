# formgator

A validation library for JavaScript `FormData` and `URLSearchParams` objects.

## Basic Usage

If you have a form with the following fields:

```html
<form method="post">
  <label>
    User Name:
    <input type="text" name="username" required />
  </label>
  <label>
    Birthday:
    <input type="date" name="birthday" />
  </label>
  <label>
    <input type="checkbox" name="newsletter" />
    Subscribe to newsletter
  </label>
  <button type="submit">Submit</button>
</form>
```

You can use `formgator` to validate the form data:

```ts
import * as fg from "formgator";

// Define a form schema
const schema = fg.form({
  username: fg.text({ required: true }),
  birthday: fg.date().asDate(),
  newsletter: fg.checkbox(),
});

async function handle(request: Request) {
  // Retrieve the form data from the request
  const form = await request.formData();

  // Validate the form data
  const data = schema.parse(form);

  // data is now an object with the following shape:
  // {
  //   username: string,
  //   birthday: Date | null,
  //   newsletter: boolean,
  // }

  // If the form data is invalid, an error will be thrown
}
```

## API

You can expect `formgator` to expose a validator for all possible `<input type="...">` values.

## Usage with SvelteKit

`formgator` exposes a SvelteKit adapter that can be used to validate form data in SvelteKit [form actions](https://kit.svelte.dev/docs/form-actions).

```ts
// +page.server.ts
import * as fg from "formgator";
import { formgate } from "formgator/sveltekit";

export const actions = {
  login: formgate(
    {
      email: fg.email({ required: true }),
      password: fg.password({ required: true }),
    },
    (data, event) => {
      // data.email and data.password are guaranteed to be strings
      // The form will be rejected as 400 Bad Request if they are missing or empty
      // event is the object that would be your first argument without formgator
    },
  ),
};
```

The parsed form result is added at the beginning of the arguments list to ensure ascending compatibility with SvelteKit; extending the `event` object might clash with upcoming features.

## Disclaimer

This package is still in development and the API is subject to change. API will be stabilized in version 1.0.0.

## License

This package is licensed under the MIT license.

This license only applies to the `formgator` package and not the rest of the code in this repository.
