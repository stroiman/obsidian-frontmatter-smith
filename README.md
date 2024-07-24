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

## Configuration

Currently the configuration is very crude. You must maintain a JSON structure
yourself.

The configuration consists of 

- _Forge_ A set of commands to run. When you run this plugin, you choose which
  forge to use.
- _Command_ A single command. Possible lists of commands are at the moment
  - Set a specific frontmatter attribute
  - Add an element to a frontmatter array
- _Value_ Contains instructions for evaluating a command. Possible options are
  - _Object_ - Generates key/value pairs, recursively evaluating values.
  - _String input_ - Prompt the user for text input.
  - _Number input_ - Prompt the user for number input.
  - _Choice_ - Prompts the user for a choice from a set of options.
  - _Constant_ - Provides a constant value

Note, that the 'choice' option has the ability to add new commands, depending on
the choice. More on this later.

I may change the structure, but I guarantee that the plugin will migrate old
configurations, hence the required `version`.

### Top Level

The top level has two keys, a `version`, which must be `"1"`, and a list of 
"forges", each forge being a named list of commands.

```json
{
  "version": "1",
  "forges": []
}
```

The behaviour depends on the length of the array.
- If the array is empty, the plugin will do nothing.
- If the array contains one element, that forge will be run.
- If the array contains multiple elements, the user will be asked which forge to run.

### Forge

```json
{
  "name": "Forge name",
  "commands": []
}
```

The name will be shown to the user, when choosing which forge to use.

### Command

### Add to array

Adds a single element to an array in the frontmatter.

- `key` - The metadata field to modify
- `value` - The instructions for evaluating the value.

NOTE: If the key already exists, but is not already an array, it will be
overwritten.

```json
{
  "$command": "add-array-element",
  "key": "string",
  "value": {}
}
```

### Set single value

Sets a metadata value in the frontmatter.

- `key` - The metadata field to modify
- `value` - The instructions for evaluating the value.

NOTE: If the key already exists, it will be overwritten.

```json
{
  "$command": "set-value",
  "key": "string",
  "value": {}
}
```


## Values

### Object value

Creates an object. Each entry in the `values` array becomes an attribute in
the final object.

```json
{
  "$type": "object",
  "values": [{
    "key": "key1",
    "value": {}
  },
  {
    "key": "key2",
    "value": {}
  }]
}
```

#### Example

If it is unclear, the following command/value configuration might make it 
clearer.

```json
{
  "$command": "set-value",
  "key": "truth",
  "value": {
    "$type": "object",
    "values": [{
      "key": "question",
      "value": { 
        "$type": "constant", 
        "value": "What is the answer to the ultimate question?"
      }
    },{
      "key": "answer",
      "value": { 
        "$type": "string-input",
        "prompt": "Please provide an answer"
      }
    }]
  }
}
```

When that example is executed, the user will receive a prompt, "Please
provide an answer". When the user types "42", and press enter, the resulting 
frontmatter would become

```yaml
truth:
  question: "What is the answer to the ultimate question?"
  answer: "42"
```

### Choice

```json
{
  "$type": "choice-input",
  "prompt": "string",
  "options": [{
    "text": "string",
    "value": "string",
    "commands": []
  }]
}
```

The `commands` is optional, If specified, they will be run if that option
is chosen.

#### Example use of options

This example lets the user select a `type` for the page. If the user
selects "Book", the user will be asked for the author of the book to set as
the `author` metadata.

```json
{
  "$command": "set-value",
  "key": "type",
  "value": {
    "$type": "choice-input",
    "prompt": "What type of page it this",
    "options": [{
      "text": "Book",
      "value": "Book",
      "commands": [{
        "$command": "setValue",
        "key": "author",
        "value": {
          "$type": "string-input",
          "prompt": "Who is the author?"
        }
      }]
    },{
      "text": "Movie",
      "value": "Movie"
    }]
  }
}
```

### String input

Presents a simple input field for the user to choose a text.

```json
{
  "$type": "string-input",
  "prompt": "Dialog title prompt"
}
```

### Number input

Like string input, but places the value as a number, rather than a string in
the frontmatter.

NOTE: Invalid numbers are silently ignored.

```json
{
  "$type": "number-input",
  "prompt": "Dialog title prompt"
}
```

### Constant value

Evaluates to a constant value.

```json
{
  "$type": "constant",
  "value": "value"
}
```

The value can be any valid metadata value, string, number, object, array,
etc.

## Todo

- Build a proper configuration UI
- Add tags
- Allow forge to run automatically on file creation
- Allow folder specific forges
- Handle error bad user input, or escape key more sensibly.

