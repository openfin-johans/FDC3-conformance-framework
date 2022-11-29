[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://finosfoundation.atlassian.net/wiki/display/FINOS/Incubating)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/6456/badge)](https://bestpractices.coreinfrastructure.org/projects/6456)

![FDC3 Conformance Framework](https://landscape.finos.org/logos/fdc3-conformance-framework.svg)

## Status

|Version    | Release | Specification |
|-----------|---------|--------|
|[FDC3 1.2](https://fdc3.finos.org/docs/1.2/fdc3-intro)   | _unreleased_ | [1.2 Tests Specification](https://github.com/finos/FDC3/blob/master/toolbox/fdc3-conformance/FDC3-1.2-Conformance-Test-Cases.md) |
|[FDC3 2.0](https://fdc3.finos.org/docs/fdc3-intro) | _in development_ | [2.0 Tests Specification](https://github.com/finos/FDC3/blob/8166c0e6aa872b2fc7b755384e5b2eeeaf88c732/toolbox/fdc3-conformance/FDC3-2.0-Conformance-Test-Cases.md) |

# FDC3 Conformance Framework

A framework for testing whether desktop containers implement the [FDC3 standard](https://fdc3.finos.org/).

## What Is It?

- There are many vendors implementing Desktop Agents for the FDC3 standard.
- Developers building apps interoperating with the FDC3 standard want to be sure that their apps will work with every Desktop Agent.
- This suite of conformance tests allows for programmatic verification of an FDC3 Desktop Agent implementation.

## Why Is This Important?

✔️ **Multiple Platforms**

It can be annoying for users to find that features in their apps that they rely on don't work when changing between Desktop Agents.  
Hopefully these conformance tests will add security around that.

✔️ **Marketing**

FINOS has created _badges_ to indicate conformance with the FDC3 standard.   
By passing the conformance tests and joining the conformance program, firms are able to use those badges in their own marketing materials.

✔️ **Backwards Compatibility**

There are multiple versions of the FDC3 standard.  
A Desktop Agent could host apps written in _any one of these versions_.  
For that reason, it's important that Desktop Agents are tested to make sure that they keep on supporting apps written against older versions of FDC3.

## How Does It Work

There are two main parts to conformance:
  
  - Running the tests _locally_ (described below), then
  - Joining the Conformance Program

### Installation / Local Running

1.  **Check Out The Repo**

This repository currently contains:

 - `tests` - the FDC3 conformance tests, implemented using Mocha / TypeScript, making use of the FDC3 type definitions, [@finos/fdc3](https://www.npmjs.com/package/@finos/fdc3).
 - `static` - HTML files used to create the static server
 - `directory` - Some JSON files in the FDC3 V2 Directory format that you can use to set up your desktop agent with either 1.2 or 2.0 test suites.
 - 'terms-conditions' - [Terms and Conditions](terms-conditions/FDC3-Certified-Terms.md) of the Conformance Program.  Instructions for joining the program are [here](Instructions.md)

2. **Install Dependencies**

In order to get started, install all the dependencies with:

```sh
npm install
```

3.  **Run The Apps Locally**

To run the conformance suite locally on port 3001:

```sh
npm run start
```

4.  **Set Up Your Desktop Agent**

You will need to set up your desktop agent so that it has an _App Directory containing all the conformance apps_.   
This step is vendor-dependent, but examples of `AppD` records can be found in the `directory` folder.

5.  **Run the tests**

You can load up the conformance app and select the tests you wish to run:

![Selecting Tests[static/selecting.png]

The tests run and produce an output in the window.  Failure are shown with a stack trace in red:

![Running Tests[static/failing.png]

Successful runs look something like this:

![Success Tests[static/running.png]

### Joining The Conformance Program

If you've had a clean run of all the tests locally, why not join the conformance program?

[Instructions here](instructions.md)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) page.

## License

Copyright 2022 FINOS 

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)

