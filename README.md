# LinakDesk Card by [@IhorSyerkov](https://github.com/IhorSyerkov)

Home Assistant Lovelace Card for controlling desks based on linak bluetooth controller.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

[![Discord][discord-shield]][discord]
[![Community Forum][forum-shield]][forum]

## Options

| Name              | Type    | Requirement  | Description                                 | Default             |
| ----------------- | ------- | ------------ | ------------------------------------------- | ------------------- |
| type              | string  | **Required** | `custom:linak-desk-card`                    |                     |
| name              | string  | **Optional** | Card name                                   | `LinakDesk`         |
| entity            | string  | **Optional** | Home Assistant entity ID.                   | `none`              |
| presets           | Array   | **Optional** | Predefined presets                          | `[]`                |

## Starting a new card from linak-desk-card

### Step 1

Clone this repository

### Step 2

Install necessary modules (verified to work in node 8.x)
`yarn install` or `npm install`

### Step 3

Do a test lint & build on the project. You can see available scripts in the package.json
`npm run build`

### Step 4

Customize to suit your needs and contribute it back to the community

## Starting a new card from linak-desk-card with [devcontainer][devcontainer]

Note: this is available only in vscode ensure you have the [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed.

1. Fork and clone the repository.
2. Open a [devcontainer][devcontainer] terminal and run `npm start` when it's ready.
3. The compiled `.js` file will be accessible on
   `http://127.0.0.1:5000/linak-desk-card.js`.
4. On a running Home Assistant installation add this to your Lovelace
   `resources:`

```yaml
- url: 'http://127.0.0.1:5000/linak-desk-card.js'
  type: module
```

_Change "127.0.0.1" to the IP of your development machine._

### Bonus

If you need a fresh test instance you can install a fresh Home Assistant instance inside the devcontainer as well.

1. Run the command `container start`.
2. Home Assistant will install and will eventually be running on port `9123`

## References

* Based on https://github.com/macbury/SmartHouse/tree/master/home-assistant/www/custom-lovelace/linak-desk