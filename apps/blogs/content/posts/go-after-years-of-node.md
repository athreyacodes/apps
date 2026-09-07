---
title: Go after years of Node
tagline: Errors are values. Goroutines are not Promises. The binary is the deploy.
description: What actually changes when someone who ships Node and Java starts writing small Go tools.
date: '2026-05-08'
mainTag: go
tags: [backend]
draft: false
---

## **What** was the situation

I did not pick up Go to replace Angular. I picked it up for small personal tools: a command that had to run on a machine with no Node, a thing I wanted to ship as one file and ignore for a year.

Coming from years of Java and Node, the surprise was not the syntax. The surprise was how much I had been relying on a runtime to hide control flow. Node has `async`/`await` and a process that stays up. Java has exceptions that skip twelve frames. Go wants you to look at the `error`.

That is the biggest difference I still keep in mind. Not goroutines. Not `gofmt`. The fact that a failed call is a value you handle on the next line, or you are lying.

## **When** does this apply

Use this when you are writing a new small program and Node is a habit, not a requirement.

- A CLI, a one-shot converter, a tiny HTTP probe.
- Something you want as a static binary on a laptop or a CI image.
- A personal project where you are the only runtime.

Skip this if the team’s production is Node and the job is a six-line script. Do not introduce Go for a punchline. The other Go note is when a CLI actually earns its keep.

## **How** is it done

Treat `error` as data. Do not panic because Java would have thrown.

```go
data, err := os.ReadFile(path)
if err != nil {
	return fmt.Errorf("read %s: %w", path, err)
}
```

The `%w` wrap is how you keep the cause. In Node you might `throw` and hope a middleware logs it. In Java you might catch `Exception` at the edge. In Go, if `main` does not see an error, the program is "fine". That is stricter than it sounds. It is also why small tools stay honest.

Goroutines are not `Promise.all`. They do not return a value you `await`. They are "run this function concurrently", and you still need a channel or an `errgroup` if you care about the result.

```go
g, ctx := errgroup.WithContext(context.Background())

g.Go(func() error {
	return ping(ctx, "threat")
})
g.Go(func() error {
	return ping(ctx, "search")
})

if err := g.Wait(); err != nil {
	return err
}
```

If you `go func()` and forget to wait, the program may exit before the work runs. Node would have kept the event loop alive. Go will not.

There are no classes in the Java sense. A struct plus a method is enough. Interfaces are implicit: if it has the methods, it fits. That feels loose until you realise you stop designing inheritance trees for a CLI that parses flags.

Modules replace npm the way you wish npm worked for a binary: a `go.mod`, a version, `go build` produces the thing you copy. No `node_modules` on the box that runs it.

Nil is real. A pointer receiver on a nil struct will panic if you are not used to checking. Node’s `undefined.foo` is a cousin. Check, or do not use a pointer.

## Watch out for

Do not `panic` for user input. Panic is for "this program is wrong". Bad flags are `err` and exit 2.

Do not clone a Node service into Go with a framework on day one. The value was the small surface. If you need a huge HTTP stack, ask why you left Node.

And do not compare goroutine count to thread count from Java and call it a win. Compare whether you can still read `main`.
