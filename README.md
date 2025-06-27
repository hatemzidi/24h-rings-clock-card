# 24h-rings-clock-card by [@hatemzidi](https://github.com/hatemzidi)
[![hacs_badge](https://img.shields.io/badge/HACS-default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

Enhanced Minimalistic 24-hours analog clock with time ranges, sun information, custom markers, and more display options.

![Preview][preview]

#### Please ⭐️ this repo if you find it useful

## TOC
- [Installation](#installation)
    - [HACS](#hacs)
    - [Manual](#manual)
- [Configuration](#configuration)
    - [Options](#options)
- [Examples](#examples)
    - [Minimal working config](#minimal-working-config)
    - [Full examples](#full-examples)
- [Known issues](#known-issues)

## Installation

### HACS
This card is available in [HACS][hacs] (Home Assistant Community Store).
Just search for `24H Rings Clock Card` in Frontend tab.

Or 

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=hatemzidi&repository=24h-rings-clock-card&category=plugin)


### Manual

1. Download `24h-rings-clock-card.js` file from the [latest-release].
2. Put `24h-rings-clock-card.js` file into your `config/www` folder.
3. Go to _Configuration_ → _Lovelace Dashboards_ → _Resources_ → Click Plus button → Set _Url_ as `/local/24h-rings-clock-card.js` → Set _Resource type_ as `JavaScript Module`.
4. Add `custom:rings-clock-card` to Lovelace UI as any other card (using either editor or YAML configuration).

## Configuration

### Options
| **Name**     | **Type** | **Requirement** | **Description**                                                                      | **Default**                  |
|--------------|----------|-----------------|--------------------------------------------------------------------------------------|------------------------------|
| type         | string   | Required        | The card type. Must be custom:rings-clock-card.                                      | custom:rings-clock-card      |
| title        | string   | Optional        | The main title displayed at the top left of the card.                                | None                         |
| header_icon  | string   | Optional        | An MDI icon to display at the top right of the card next to the title.               | None                         |
| hand_color   | string   | Optional        | Custom color for the hour hand and the center dot (e.g., "#FF0000" or "red").        | var(--accent-color, #03a9f4) |
| show_hours   | boolean  | Optional        | Show/hide the hour numbers (00-23) on the clock face.                                | true                         |
| show_legends | boolean  | Optional        | Show/hide the legends at the bottom of the card for ranges, markers, and sun events. | true                         |
| sun          | object   | Optional        | [Sun options](#sun-options) to display sunrise and sunset markers.                   | See Sun Options              |
| ranges       | array    | Optional        | An array of [Range options](#ranges-options) to define custom time arcs.             | []                           |
| markers      | array    | Optional        | An array of [Marker options](#markers-options) to define custom time markers.        | []                           |


### Sun Options
| **Name**            | **Type** | **Requirement** | **Description**                                                 | **Default**                  |
|---------------------|----------|-----------------|-----------------------------------------------------------------|------------------------------|
| entity              | string   | Optional        | The Home Assistant sun entity ID (e.g., sun.sun).               | sun.sun                      |
| show                | boolean  | Optional        | Show/hide the sunrise and sunset markers on the clock face.     | true                         |
| color               | string   | Optional        | Custom color for the sun markers (e.g., "#FFA500" or "orange"). | var(--accent-color, #FFA500) |
| show_day_night_arcs | string   | Optional        | Show/hide the day and night arcs.                               | true                         |
| day_arc_color       | string   | Optional        | Custom color for the day arc (e.g., "#FFA500" or "orange").     | #FFD700                      |
| night_arc_color     | string   | Optional        | Custom color for the night arc (e.g., "#FFA500" or "orange").   | #34495e                      |


### Ranges Options
| **Name**       | **Type** | **Requirement** | **Description**                                                                                                                | **Default**                  |
|----------------|----------|-----------------|--------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| start_time     | string   | Required        | The start time of the arc (e.g., "06:00") or an entity ID (e.g., input_datetime.my_start_time or sensor.my_sensor#start_time). | None                         |
| end_time       | string   | Required        | The end time of the arc (e.g., "18:00") or an entity ID (e.g., input_datetime.my_end_time or sensor.my_sensor#end_time).       | None                         |
| ring           | string   | Optional        | Specifies which ring the arc should be drawn on (ring1, ring2, ring3, or ring4).                                               | ring1                        |
| color          | string   | Optional        | Custom color for the arc (e.g., "#03a9f4" or "blue").                                                                          | var(--accent-color, #03a9f4) |
| name           | string   | Optional        | Name for the arc legend entry.                                                                                                 | None                         |
| show_in_legend | boolean  | Optional        | Show/hide the color and the name of the range in the legends.                                                                  | true                         |
| width          | string   | Optional        | Specifies the width of the ring. Should be XS, S, M or L.                                                                      | M                            |

### Markers Options
| **Name**       | **Type** | **Requirement** | **Description**                                                                                                            | **Default**                     |
|----------------|----------|-----------------|----------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| time           | string   | Required        | The time for the marker (e.g., "12:00") or an entity ID (e.g., input_datetime.my_event_time or sensor.my_sensor#my_event). | None                            |
| name           | string   | Optional        | Name for the marker legend entry.                                                                                          | None                            |
| icon           | string   | Optional        | An MDI icon for the marker.                                                                                                | •                               |
| color          | string   | Optional        | Custom color for the marker (e.g., "gold" or "green").                                                                     | var(--primary-text-color, #333) |
| indicator      | string   | Optional        | Show it either as marker or as dot                                                                                         | marker                          |
| show_in_legend | boolean  | Optional        | Show/hide the colored icon and the name of the marker in the legends.                                                      | true                            |


## Examples

### Minimal working config
```yaml
type: custom:rings-clock-card
show_legends: false # Hide legends for a more minimal look
markers:
  - time: "14:30"
    name: "Meeting"
    color: '#FF5722' # Orange
    icon: "mdi:calendar-clock"
```                            

### Full examples
```yaml
type: custom:rings-clock-card
title: 'My Daily Schedule'
header_icon: 'mdi:clock-outline' # Example header icon
hand_color: '#DC143C' # Crimson red for the hour hand
show_rings: true
show_hours: true
show_legends: true
sun:
  entity: 'sun.sun'
  show: true
  color: '#FFD700' # Gold color for sun markers
  show_day_night_arcs: true #Show the day and night arcs
ranges:
  - start_time: 'input_datetime.work_start' # Using an entity for start time
    end_time: 'input_datetime.work_end'   # Using an entity for end time
    ring: 'ring1'
    color: '#4CAF50' # Green for work hours
    name: 'Work Hours'
  - start_time: 'sensor.my_sensor#start' #  Using a sensor for start time
    end_time: 'sensor.my_sensor#end'   # Using a sensor for end time
    ring: 'ring4'
    color: '#4CAF50' 
    name: 'Focus Hours'    
  - start_time: '18:00'
    end_time: '23:00'
    ring: 'ring2'
    color: '#2196F3' # Blue for evening
    name: 'Evening Chill'
  - start_time: '00:00' # Crosses midnight
    end_time: '06:00'
    ring: 'ring3'
    color: '#9C27B0' # Purple for night
    name: 'Sleep Time'
markers:
  - time: '08:00'
    name: 'Breakfast'
    icon: 'mdi:silverware-fork-knife'
    color: '#FF5722' # Orange
    indicator: 'dot'
  - marker: 'sensor.my_sensor#event' # Marker from a sensor
    name: 'My Event'
    icon: 'mdi:dumbbell'
    color: '#00BCD4' # Cyan
  - time: 'input_datetime.gym_time' # Marker from an entity
    name: 'Gym Session'
    icon: 'mdi:dumbbell'
    color: '#673AB7' # Deep Purple
  - time: '22:00'
    name: 'Bedtime Reminder'
    icon: 'mdi:bed-empty'
    color: '#795548' # Brown
```                                

## Known issues
When you discover any bugs please open an [issue](https://github.com/hatemzidi/24h-rings-clock-card/issues).


---
[![beer](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://buymeacoffee.com/hatemzidi)

<!-- References -->
[hacs]: https://hacs.xyz
[preview]: https://raw.githubusercontent.com/hatemzidi/24h-rings-clock-card/main/assets/24h-rings-clock.jpg

<!-- obsolete -->
[latest-release]: https://github.com/hatemzidi/24h-rings-clock-card/releases/latest
[releases-shield]: https://img.shields.io/github/release/custom-cards/slider-button-card.svg?style=for-the-badge
[releases]: https://github.com/hatemzidi/24h-rings-clock-card/releases
