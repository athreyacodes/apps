---
title: Small Go CLIs still earn their keep
tagline: One binary, flags, and an honest exit code.
description: How a tiny Go command stays honest — flags, exit codes, and tests you can run in one file.
date: '2026-04-03'
mainTag: go
tags: [backend]
draft: false
---

## **What** was the situation

I reach for Go when I want a command I can ship as one binary and forget about. No runtime to install. No framework to upgrade next month. Flags, a bit of logic, a non-zero exit when the input is wrong.

A lot of tools start as a generated scaffold. That is fine until the scaffold is bigger than the job. For a command that does one thing, `flag` plus a function you can test is enough.

This is the same bias as How itself. Markdown in, static HTML out, no extra runtime. The CLI version of that idea is a small Go command.

## **When** does this apply

Use this when the job is a pipe in a larger flow. Someone will type it, or a script will call it, and it should either print a result or fail out loud.

- A rename, a lint, a codegen, a check against a folder of files.
- Something you want on a machine that does not have Node or Python set up.
- A command you will not touch for a year, then run again, and it should still work.

Skip this when you are building a long-running service, or a UI, or something that needs plugins. That is not a small CLI any more. Also skip it if the team already has a strong script in a language they all run every day, and the job is throwaway.

If you can describe the tool in one sentence, and the output is text, start with Go and `flag`.

## **How** is it done

Start with `flag` and a non-zero exit on bad input. Exit code `2` is a decent "you used this wrong" signal. `1` can stay for "it ran, then failed".

```go
package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	name := flag.String("name", "", "package to inspect")
	flag.Parse()

	if *name == "" {
		fmt.Fprintln(os.Stderr, "how: -name is required")
		os.Exit(2)
	}

	fmt.Println(*name)
}
```

That `main` is still awkward to test, because `os.Exit` ends the process. So keep the real logic in a function that returns an error. `main` only parses flags, calls `run`, and exits.

```go
func run(name string) error {
	if name == "" {
		return fmt.Errorf("name is required")
	}
	return nil
}

func TestRun(t *testing.T) {
	if err := run(""); err == nil {
		t.Fatal("expected an error")
	}
}
```

Now the table tests can live next to the code. You do not need a framework to say "empty name should fail".

Ship the binary. Put the usage in `-h`. Keep the surface small enough that you can hold it in your head.

## Watch out for

Do not log on success and also print the result. Scripts will mix the two. Print data on stdout. Print problems on stderr.

Do not swallow errors and exit 0. A pipeline will keep going with garbage.

And do not grow a config file until you have a second actual setting. Flags are allowed to be enough.
