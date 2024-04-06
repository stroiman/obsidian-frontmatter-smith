# Obsidian Frontmatter Smith

This is a plugin for Obsidian to help add frontmatter to markdown files, 
particularly when you want to have more complex types, such as objects, or
arrays of objects.

## Use cases

One use case is that I make a record of medicine I take. For each entry I want
record:

- The type
- The dose
- The time.

This is placed in an array, each element being an object. An example frontmatter
could be this

```yaml
medicine:
  - type: "[[Link]]"
    dose: 123mg
    time: 07:30
  - type: "[[Link]]"
    dose: 12mg
    timt: 16:00
```

## Notes regarding tests

(NOTE, this was written long before the implementation of the use cases were
added, so this description is a bit detached from the actual tests)

The design of an obsidian plugin has some unfortunate effects on plugin 
development. You create a class that extends from `Plugin` in the `obsidian`
package. But that package is not public, so you are not able to create the
yourself. During development, the only thing you have in the `obsidian` 
library is the TypeScript type definitions.

So, if we want to create an instance of our class, we need to mock the base
class. Not every programming language supports that, but you can actually do
that in JavaScript.

First, in TypeScript, the `Plugin` type is actually not a type for the class
itself, it is an interface for instances of the class. This can be confusing
because the same identifier also refers to a JavaScript value which _is_ the
class (or the constructor to be exact). So to do this, I define an interface
for the constructor.

```typescript
interface PluginConstructor {
	new (): Plugin;
}

const createPluginClass = (baseClass: PluginConstructor) => {
	return class MyPlugin extends baseClass {};
};
```

So now, we can reduce the main.ts to this.

```typescript
import { Plugin } from "obsidian";
import { createPluginClass, PluginConstructor } from "./main-impl.ts"
export default createPluginClass(Plugin as PluginConstructor);
```


Mocha in watch mode is launched by [nodemon](https://github.com/remy/nodemon).
This is becuase the watcher with the tsx module loader will crash on syntactic
errors, such as mismatched braces.

Without a tool like nodemon, you'd have to manually relaunch.
