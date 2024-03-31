# Obsidian Frontmatter Smith

This is a plugin for Obsidian to help add frontmatter to 

## Use cases

I may have an idea for a pubslihed article about some aspect of JavaScript 
development. For that, I might want to have an `type: Article` property, as
well as something like `state: in-progress`, and I might want to have tags,
such as `javascript`, `software-development`, `tdd`, etc.

This plugin makes it much easier to add these types.

## Notes regarding tests

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
