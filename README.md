# waycharter

Express middleware for HATEOAS level 3 RESTful APIs that provide hypermedia controls using:
  - Link ([RFC8288](https://tools.ietf.org/html/rfc8288)) and [Link-Template](https://mnot.github.io/I-D/link-template/) headers.

This library is compatible with Node.js 10.x, 12.x and 14.x

[![License](https://img.shields.io/github/license/mountain-pass/waycharter?logo=apache)](https://github.com/mountain-pass/waycharter/blob/master/LICENSE) [![npm](https://img.shields.io/npm/v/@mountainpass/waycharter?logo=npm)](https://www.npmjs.com/package/@mountainpass/waycharter) [![npm downloads](https://img.shields.io/npm/dm/@mountainpass/waycharter?logo=npm)](https://www.npmjs.com/package/@mountainpass/waycharter)

[![Build Status](https://img.shields.io/github/workflow/status/mountain-pass/waycharter/Build?logo=github)](https://github.com/mountain-pass/waycharter/actions?query=workflow%3ABuild)

[![GitHub issues](https://img.shields.io/github/issues/mountain-pass/waycharter?logo=github)](https://github.com/mountain-pass/waycharter/issues) [![GitHub pull requests](https://img.shields.io/github/issues-pr/mountain-pass/waycharter?logo=github)](https://github.com/mountain-pass/waycharter/pulls)

<!-- [![Quality](https://img.shields.io/codacy/grade/940768d54f7545f7b42f89b26c23c751?logo=codacy)](https://www.codacy.com/gh/mountain-pass/waycharter/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mountain-pass/waycharter&amp;utm_campaign=Badge_Grade) [![Coverage](https://img.shields.io/codacy/coverage/940768d54f7545f7b42f89b26c23c751?logo=codacy)](https://www.codacy.com/gh/mountain-pass/waycharter/dashboard?utm_source=github.com&utm_medium=referral&utm_content=mountain-pass/waycharter&utm_campaign=Badge_Coverage) -->

[![source code vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/mountain-pass/waycharter?label=source%20code%20vulnerabilities&logo=snyk)](https://snyk.io/test/github/mountain-pass/waycharter) [![npm package vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@mountainpass/waycharter@1.0.20?label=npm%20package%20vulnerabilties&logo=snyk)](https://snyk.io/test/npm/@mountainpass/waycharter/1.0.20)


[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

![I love badges](https://img.shields.io/badge/%E2%99%A5%20i%20love-%20badges-green?logo=heart)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)
# ToC

- [waycharter](#waycharter)
- [ToC](#toc)
- [Usage](#usage)
  - [Node.js](#nodejs)
  - [Browser](#browser)
  - [Getting the response](#getting-the-response)
    - [Getting the response body](#getting-the-response-body)
  - [Requesting linked resources](#requesting-linked-resources)
    - [Multiple links with the same relationship](#multiple-links-with-the-same-relationship)
  - [Forms](#forms)
    - [Query forms](#query-forms)
    - [Path parameter forms](#path-parameter-forms)
    - [Request body forms](#request-body-forms)
    - [DELETE, POST, PUT, PATCH](#delete-post-put-patch)
- [Examples](#examples)
  - [HAL](#hal)
  - [Siren](#siren)
- [Upgrading from 1.x to 2.x](#upgrading-from-1x-to-2x)
  - [Removal of Loki](#removal-of-loki)
    - [Operation count](#operation-count)
    - [Finding operations](#finding-operations)
- [Upgrading from 2.x to 3.x](#upgrading-from-2x-to-3x)
  - [Accept Header](#accept-header)
    - [Handlers](#handlers)
  - [Error responses](#error-responses)
  - [Invoking missing operations](#invoking-missing-operations)
  - [Handling location headers](#handling-location-headers)

# Usage

TODO

