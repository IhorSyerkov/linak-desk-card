# LinakDesk Card by [@IhorSyerkov](https://github.com/IhorSyerkov)

[![hacs][hacs-image]][hacs-url]

> [Home Assistant][home-assistant] Lovelace Card for controlling desks based on linak bluetooth controller.

Designed to work with https://github.com/j5lien/esphome-idasen-desk-controller

## HACS

- Add `https://github.com/IhorSyerkov/linak-desk-card` as custom repository to the [HACS](https://hacs.xyz/)

## Config

```yaml
type: 'custom:linak-desk-card'
name: ''
desk: cover.desk
height_sensor: sensor.desk_height
moving_sensor: binary_sensor.desk_moving
connection_sensor: binary_sensor.desk_connection
minHeight: 62
maxHeight: 127
presets:
  - label: Stay
    target: 108
  - label: Sit
    target: 76
```

## Options

| Name               | Type    | Requirement  | Description                                 | Default             |
| ------------------ | ------- | ------------ | ------------------------------------------- | ------------------- |
| `type`             | `string`| **Required** | `custom:linak-desk-card`                    |                     |
| `name`             | `string`| **Optional** | Card name                                   | `` .                |
| `desk`             | `string`| **Required** | Home Assistant entity ID (cover).           | `none`              |
| `moving_sensor`    | `string`| **Required** | Home Assistant entity ID (sensor).          | `none`              |
| `connection_sensor`| `string`| **Required** | Home Assistant entity ID (binary_sensor).   | `none`              |
| `height_sensor`    | `string`| **Required** | Home Assistant entity ID (binary_sensor).   | `none`              |
| `max_height`       | `number`| **Required** | Desk height in min position.                | `none`              |
| `min_height`       | `number`| **Required** | Desk height in max position.                | `none`              |
| `presets`          | `Array` | **Optional** | Predefined presets                          | `[]`                |

### `preset` object

| Name        |   Type   | Description             |
| ----------- | :------: | ----------------------- |
| `label`     | `string` | Preset label.           |
| `target`    | `number` | Absolute height in cm   |

## Supported languages

This card supports translations. Please, help to add more translations and improve existing ones. Here's a list of supported languages:

- English
- Українська (Ukrainian)

## Supported models

- Ikea IDÅSEN
## References

* Inspired by https://github.com/macbury/SmartHouse/tree/master/home-assistant/www/custom-lovelace/linak-desk

## License

MIT ©

[home-assistant]: https://www.home-assistant.io/
[hacs]: https://hacs.xyz
[hacs-url]: https://github.com/custom-components/hacs
[hacs-image]: https://img.shields.io/badge/hacs-default-orange.svg?style=flat-square