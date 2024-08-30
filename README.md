# Obsidian Frontmatter Smith

This is a plugin for Obsidian to help add frontmatter to markdown files, 
particularly when you want to have more complex types, such as objects, or
arrays of objects.

> [!WARNING]
> There is currently _NO_ input validation. So if "key" properties are not valid
> frontmatter keys, things will probably just fail for weird reasons. This is
> something that I intent to look into.

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

Maininting an array manually is cumbersome, but the command "Add medicine" will
handle that easily. I will be prompted for each individual value, i.e. type,
dose, and time. The plugin will then create an object of this values and add it
as a new entry to the array.

Another use case is when one choice triggers a new set of options. For example,
you may have a general, `type` in your frontmatter, describing what this note is
about. For notes on books, you could have `type: "Book"`. When you choose book,
the smith can then be configured to ask for other properties relevant for book
notes, such as `author`, `isbn`, `published`, etc.

## A note about frontmatter

The frontmatter in Obsidian can store complex structures of arrays containing
objects containing arrays. Complex structures may not display very well, but the
information in the [YAML](https://en.wikipedia.org/wiki/YAML) structure _is_
preserved.

And tools like [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) _can_
query and present the complex structure.

As such, I personnally follow the philosophy that I store the information in a
format that best describes the information; and disregard whether or not the
frontmatter editor can show it nicely. (It is still shown, but just as a
[JSON](https://www.json.org/json-en.html)
structure)

## Configuration

There are three concepts to understand in configuring Frontmatter Smith

- Forges
- Commands
- Values

### Forges

The top level entity that you choose. When you run the plugin, you pick a forge
to use. If you only have one forge in the configuration, this will automatically
be chosen.

Each forge contains one or more commands that are all executed when running the
forge.

### Command

A command describes an action to be carried out to the frontmatter. Two actions
exist right now:

- Set value. Sets a single value in the frontmatter, overwriting any existing
  value.
- Add to array. Treats the frontmatter as an array, and allows you to add a new
  element to the array. If property exists with a non-array value, the previous
  value will be discarded.

Both of the actions have a `value` that determines what the value should be.
I.e. for "Set Value", the value to be assigned to the frontmatter property, and
for "Add to array", the value to be added to the array.

### Value

The "value" decides how the value is created. This is also where user
interaction is introduced, depending on the type of value.

Simple value types

- _Constant_ - Provides a constant value in the configuration. The user will
  not be prompted for input.
- _String input_ - Prompt the user for text input.
- _Number input_ - Prompt the user for number input.

Complex value types are

- _Object_ - Creates a key/value dictionary. 
- _Choice_ - Present the user with a list of values, allowing the user to select
  one.

#### Object input

When you configure an object value, you must add items for each key in the
object. For each key, you must specify a value, which is a `Value` in itself
(which can be constant, text input, object, etc)

####  Choice input

For a choice input, the user must select from a list of predefined choices. Each
choice has a "Text" - that the user will see, and a "value" that is inserted in
the frontmatter. 

You wrap the value in `[[ ]]` to insert a link.

> [!NOTE]
> You must specify both 'text' and 'value', even if they are the same. That is
> on the TODO list.

> [!NOTE]
> If you rename the file being linked to, Obsidian will automatically update
> the links in your frontmatter if you use this approach. However, Obsidian
> doesn't know anything about the plugin configuration for Frontmatter Smith; so
> it is up to you to update those yourself.

##### Sub commands

Each option in a choice value can have a list of commands. E.g. This pseudo
configuration illustrates how choosing a "Book" adds a new "Command" configured
to set the `author` property.

```yaml
- set-value:
    key: "type"
    value:
      type: "Choice"
      options:
        - text: Movie
          type: [[Movie]]
        - text: Book
          type: [[Book]]
          commands:
          - set-value:
              key: "author"
              value:
                type: "string-input"
```

## API

There is a simple API that can be accessed by other scripts, or by custom script
code in [Templater](https://silentvoid13.github.io/Templater/) tempaltes.

```javascript
const frontmatterSmithApi = app.plugins.plugins['frontmatter-smith'].api;
const forge = frontmatterSmithApi.findForgeByName('FORGE NAME')
if (forge) {
  await forge.runOnFile(file) // This must be an Obsidian TFile instance.
}
```

### Example, integration with Templater

In one vault, I have segregated data by folders, and I have a forge for each
folder. The forge is named after the folder it is related to. The following
script in my Templater template will check if there is a forge for the directory
of the file, _and automatically run it after a file has been created_.

```
<%*
const file = tp.config.target_file
const folder = file.parent.name;
const api = app.plugins.plugins['frontmatter-smith'].api
const forge = api.findForgeByName(folder)
if (forge) {
  // runOnFile returns a promise, but don't `await` it here. Then templater
  // will not complete until _after_ we modified the file, and a race condition 
  // will cause the one's changes overwritten by the other.
  forge.runOnFile(file)
}
-%>
```

## Planned features

- Better UX in the editor. Maybe a more "modal" approach
- Allow snapshots of the configuraiton.
  - This is probably somewhat confusing. And unless you use dedicated version
    control software, like git, to version the configuration, it can be easy to
    lose a good configuration. Adding snapshots will help getting back to a good
    configuration.
- Support a "reusable" commands. 
  - E.g. if you want to have two choices to both trigger the same command, you have to duplicate the command right now.
- Add support for adding tags
- Allow forge to run automatically on file creation (? maybe the API feature makes this less necessary)
- Allow folder specific forges, i.e. a forge is only relevant for notes in a
  specific folder.
- Handle error bad user input, or escape key more sensibly. I.e., if you press
  <kbd>esc</kbd> in a subcommand of a subcommand, do we abort everything, or just
  the innermost command. This should be configuratble
