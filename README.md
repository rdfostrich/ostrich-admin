# OSTRICH Admin

[![Greenkeeper badge](https://badges.greenkeeper.io/rdfostrich/ostrich-admin.svg)](https://greenkeeper.io/)

A Web GUI for interacting with an [OSTRICH](https://github.com/rdfostrich/ostrich) store.

Functionality:
* **Version Materialization**: Query a certain version by triple pattern.
* **Delta Materialization**: Query differences between two versions by triple pattern.
* **Version Queries**: Query all versions by triple pattern.
* **Ingest**: Append a new changeset.
* **Stats**: Basic statistics about the store.

## Install

OSTRICH requires ZLib, Kyoto Cabinet and CMake (compilation only) to be installed.

```bash
$ npm install
```

## Run

When running, you have to pass a path to an OSTRICH store.

```bash
$ npm start data/mystore.ostrich/
```

The Web GUI will now be running on http://localhost:3000/.

Optionally, a second prefixes file parameter can be added, which defaults to `config/prefixes.json`.

_Some example OSTRICH datasets are available here: https://linkedsoftwaredependencies.org/raw/ostrich/datasets/_

## License
This software is written by [Ruben Taelman](http://rubensworks.net/) and colleagues.

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).
