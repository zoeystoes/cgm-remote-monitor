Nightscout Web Monitor (a.k.a. cgm-remote-monitor)
======================================

![nightscout horizontal](https://cloud.githubusercontent.com/assets/751143/8425633/93c94dc0-1ebc-11e5-99e7-71a8f464caac.png)

[![Build Status][build-img]][build-url]
[![Dependency Status][dependency-img]][dependency-url]
[![Coverage Status][coverage-img]][coverage-url]
[![Codacy Badge][codacy-img]][codacy-url]
[![Gitter chat][gitter-img]][gitter-url]
[![Stories in Ready][ready-img]][waffle]
[![Stories in Progress][progress-img]][waffle]

[![Deploy to Heroku][heroku-img]][heroku-url]

This acts as a web-based CGM (Continuous Glucose Monitor) to allow
multiple caregivers to remotely view a patient's glucose data in
real time.  The server reads a MongoDB which is intended to be data
from a physical CGM, where it sends new SGV (sensor glucose values) as
the data becomes available.  The data is then displayed graphically
and blood glucose values are predicted 0.5 hours ahead using an
autoregressive second order model.  Alarms are generated for high and
low values, which can be cleared by any watcher of the data.

# [#WeAreNotWaiting](https://twitter.com/hashtag/wearenotwaiting?src=hash&vertical=default&f=images) and [this](https://vimeo.com/109767890) is why.

Community maintained fork of the
[original cgm-remote-monitor][original].

[build-img]: https://img.shields.io/travis/nightscout/cgm-remote-monitor.svg
[build-url]: https://travis-ci.org/nightscout/cgm-remote-monitor
[dependency-img]: https://img.shields.io/david/nightscout/cgm-remote-monitor.svg
[dependency-url]: https://david-dm.org/nightscout/cgm-remote-monitor
[coverage-img]: https://img.shields.io/coveralls/nightscout/cgm-remote-monitor/master.svg
[coverage-url]: https://coveralls.io/r/nightscout/cgm-remote-monitor?branch=master
[codacy-img]: https://www.codacy.com/project/badge/f79327216860472dad9afda07de39d3b
[codacy-url]: https://www.codacy.com/app/Nightscout/cgm-remote-monitor
[gitter-img]: https://img.shields.io/badge/Gitter-Join%20Chat%20%E2%86%92-1dce73.svg
[gitter-url]: https://gitter.im/nightscout/public
[ready-img]: https://badge.waffle.io/nightscout/cgm-remote-monitor.svg?label=ready&title=Ready
[waffle]: https://waffle.io/nightscout/cgm-remote-monitor
[progress-img]: https://badge.waffle.io/nightscout/cgm-remote-monitor.svg?label=in+progress&title=In+Progress
[heroku-img]: https://www.herokucdn.com/deploy/button.png
[heroku-url]: https://heroku.com/deploy
[original]: https://github.com/rnpenguin/cgm-remote-monitor

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Install](#install)
- [Usage](#usage)
  - [Updating my version?](#updating-my-version)
  - [What is my mongo string?](#what-is-my-mongo-string)
  - [Configure my uploader to match](#configure-my-uploader-to-match)
  - [Nightscout API](#nightscout-api)
      - [Example Queries](#example-queries)
  - [Environment](#environment)
    - [Required](#required)
    - [Features/Labs](#featureslabs)
    - [Core](#core)
    - [Predefined values for your browser settings (optional)](#predefined-values-for-your-browser-settings-optional)
    - [Plugins](#plugins)
      - [Default Plugins](#default-plugins)
      - [Built-in/Example Plugins:](#built-inexample-plugins)
      - [Extended Settings](#extended-settings)
      - [Pushover](#pushover)
      - [IFTTT Maker](#ifttt-maker)
    - [Treatment Profile](#treatment-profile)
  - [Setting environment variables](#setting-environment-variables)
    - [Vagrant install](#vagrant-install)
  - [More questions?](#more-questions)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Install

Requirements:

- [Node.js](http://nodejs.org/)

Clone this repo then install dependencies into the root of the project:

```bash
$ npm install
```

#Usage

The data being uploaded from the server to the client is from a
MongoDB server such as [mongolab][mongodb].

[mongodb]: https://mongolab.com
[autoconfigure]: http://nightscout.github.io/pages/configure/
[mongostring]: http://nightscout.github.io/pages/mongostring/
[update-fork]: http://nightscout.github.io/pages/update-fork/

## Updating my version?
The easiest way to update your version of cgm-remote-monitor to our latest
recommended version is to use the [update my fork tool][update-fork].  It even
gives out stars if you are up to date.

## What is my mongo string?

Try the [what is my mongo string tool][mongostring] to get a good idea of your
mongo string.  You can copy and paste the text in the gray box into your
`MONGO_CONNECTION` environment variable.

## Configure my uploader to match

Use the [autoconfigure tool][autoconfigure] to sync an uploader to your config.


## Nightscout API

The Nightscout API enables direct access to your DData without the need for direct Mongo access.
You can find CGM data in `/api/v1/entries`, Care Portal Treatments in `/api/v1/treatments`, and Treatment Profiles in `/api/v1/profile`.
The server status and settings are available from `/api/v1/status.json`.

By default the `/entries` and `/treatments` APIs limit results to the the most recent 10 values from the last 2 days.
You can get many more results, by using the `count`, `date`, `dateString`, and `created_at` parameters, depending on the type of data you're looking for.
 
#### Example Queries

(replace `http://localhost:1337` with your base url, YOUR-SITE)
  
  * 100's: `http://localhost:1337/api/v1/entries.json?find[sgv]=100`
  * BGs between 2 days: `http://localhost:1337/api/v1/entries/sgv.json?find[dateString][$gte]=2015-08-28&find[dateString][$lte]=2015-08-30`
  * Juice Box corrections in a year: `http://localhost:1337/api/v1/treatments.json?count=1000&find[carbs]=15&find[eventType]=Carb+Correction&find[created_at][$gte]=2015`
  * Boluses over 2U: `http://localhost:1337/api/v1/treatments.json?find[insulin][$gte]=2`

The API is Swagger enabled, so you can generate client code to make working with the API easy.
To learn more about the Nightscout API, visit https://YOUR-SITE.com/api-docs.html or review [swagger.yaml](swagger.yaml).


## Environment

`VARIABLE` (default) - description

### Required

  * `MONGO_CONNECTION` - Your mongo uri, for example: `mongodb://sally:sallypass@ds099999.mongolab.com:99999/nightscout`
  * `DISPLAY_UNITS` (`mg/dl`) - Choices: `mg/dl` and `mmol`.  Setting to `mmol` puts the entire server into `mmol` mode by default, no further settings needed.

### Features/Labs

  * `ENABLE` - Used to enable optional features, expects a space delimited list, such as: `careportal rawbg iob`, see [plugins](#plugins) below
  * `DISABLE` - Used to disable default features, expects a space delimited list, such as: `direction upbat`, see [plugins](#plugins) below
  * `API_SECRET` - A secret passphrase that must be at least 12 characters long, required to enable `POST` and `PUT`; also required for the Care Portal
  * `BG_HIGH` (`260`) - must be set using mg/dl units; the high BG outside the target range that is considered urgent
  * `BG_TARGET_TOP` (`180`) - must be set using mg/dl units; the top of the target range, also used to draw the line on the chart
  * `BG_TARGET_BOTTOM` (`80`) - must be set using mg/dl units; the bottom of the target range, also used to draw the line on the chart
  * `BG_LOW` (`55`) - must be set using mg/dl units; the low BG outside the target range that is considered urgent
  * `ALARM_TYPES` (`simple` if any `BG_`* ENV's are set, otherwise `predict`) - currently 2 alarm types are supported, and can be used independently or combined.  The `simple` alarm type only compares the current BG to `BG_` thresholds above, the `predict` alarm type uses highly tuned formula that forecasts where the BG is going based on it's trend.  `predict` **DOES NOT** currently use any of the `BG_`* ENV's
  * `BASE_URL` - Used for building links to your sites api, ie pushover callbacks, usually the URL of your Nightscout site you may want https instead of http


### Core

  * `MONGO_COLLECTION` (`entries`) - The collection used to store SGV, MBG, and CAL records from your CGM device
  * `MONGO_TREATMENTS_COLLECTION` (`treatments`) -The collection used to store treatments entered in the Care Portal, see the `ENABLE` env var above
  * `MONGO_DEVICESTATUS_COLLECTION`(`devicestatus`) - The collection used to store device status information such as uploader battery
  * `PORT` (`1337`) - The port that the node.js application will listen on.
  * `SSL_KEY` - Path to your ssl key file, so that ssl(https) can be enabled directly in node.js
  * `SSL_CERT` - Path to your ssl cert file, so that ssl(https) can be enabled directly in node.js
  * `SSL_CA` - Path to your ssl ca file, so that ssl(https) can be enabled directly in node.js


### Predefined values for your browser settings (optional)
  * `TIME_FORMAT` (`12`)- possible values `12` or `24`
  * `NIGHT_MODE` (`off`) - possible values `on` or `off`
  * `SHOW_RAWBG` (`never`) - possible values `always`, `never` or `noise`
  * `CUSTOM_TITLE` (`Nightscout`) - Usually name of T1
  * `THEME` (`default`) - possible values `default` or `colors`
  * `ALARM_URGENT_HIGH` (`on`) - possible values `on` or `off`
  * `ALARM_HIGH` (`on`) - possible values `on` or `off`
  * `ALARM_LOW` (`on`) - possible values `on` or `off`
  * `ALARM_URGENT_LOW` (`on`) - possible values `on` or `off`
  * `ALARM_TIMEAGO_WARN` (`on`) - possible values `on` or `off`
  * `ALARM_TIMEAGO_WARN_MINS` (`15`) - minutes since the last reading to trigger a warning
  * `ALARM_TIMEAGO_URGENT` (`on`) - possible values `on` or `off`
  * `ALARM_TIMEAGO_URGENT_MINS` (`30`) - minutes since the last reading to trigger a urgent alarm
  * `SHOW_PLUGINS` - enabled plugins that should have their visualizations shown, defaults to all enabled
  * `LANGUAGE` (`en`) - language of Nighscout. If not available english is used

### Plugins

  Plugins are used extend the way information is displayed, how notifications are sent, alarms are triggered, and more.

  The built-in/example plugins that are available by default are listed below.  The plugins may still need to be enabled by adding to the `ENABLE` environment variable.

#### Default Plugins
  
  These can be disabled by setting the `DISABLE` env var, for example `DISABLE="direction upbat"`

  * `delta` (BG Delta) - Calculates and displays the change between the last 2 BG values.
  * `direction` (BG Direction) - Displays the trend direction.
  * `upbat` (Uploader Battery) - Displays the most recent battery status from the uploader phone.
  * `errorcodes` (CGM Error Codes) - Generates alarms for CGM codes `9` (hourglass) and `10` (???).
  * `ar2` ([Forcasting using AR2 algorithm](https://github.com/nightscout/nightscout.github.io/wiki/Forecasting)) - Generates alarms based on forecasted values.
    * Enabled by default if no thresholds are set **OR** `ALARM_TYPES` includes `predict`.
    * Use [extended settings](#extended-settings) to adjust AR2 behavior:
      * `AR2_USE_RAW` (`false`) - to forecast using `rawbg` values when standard values don't trigger an alarm.
      * `AR2_CONE_FACTOR` (`2`) - to adjust size of cone, use `0` for a single line.
  * `simplealarms` (Simple BG Alarms) - Uses `BG_HIGH`, `BG_TARGET_TOP`, `BG_TARGET_BOTTOM`, `BG_LOW` thresholds to generate alarms.
    * Enabled by default if 1 of these thresholds is set **OR** `ALARM_TYPES` includes `simple`.

#### Built-in/Example Plugins:

  * `rawbg` (Raw BG) - Calculates BG using sensor and calibration records from and displays an alternate BG values and noise levels.
  * `iob` (Insulin-on-Board) - Adds the IOB pill visualization in the client and calculates values that used by other plugins.  Uses treatments with insulin doses and the `dia` and `sens` fields from the [treatment profile](#treatment-profile).
  * `cob` (Carbs-on-Board) - Adds the COB pill visualization in the client and calculates values that used by other plugins.  Uses treatments with carb doses and the `carbs_hr`, `carbratio`, and `sens` fields from the [treatment profile](#treatment-profile).
  * `bwp` (Bolus Wizard Preview) - This plugin in intended for the purpose of automatically snoozing alarms when the CGM indicates high blood sugar but there is also insulin on board (IOB) and secondly, alerting to user that it might be beneficial to measure the blood sugar using a glucometer and dosing insulin as calculated by the pump or instructed by trained medicare professionals. ***The values provided by the plugin are provided as a reference based on CGM data and insulin sensitivity you have configured, and are not intended to be used as a reference for bolus calculation.*** The plugin calculates the bolus amount when above your target, generates alarms when you should consider checking and bolusing, and snoozes alarms when there is enough IOB to cover a high BG. Uses the results of the `iob` plugin and `sens`, `target_high`, and `target_low` fields from the [treatment profile](#treatment-profile). Defaults that can be adjusted with [extended setting](#extended-settings)
    * `BWP_WARN` (`0.50`) - If `BWP` is > `BWP_WARN` a warning alarm will be triggered.
    * `BWP_URGENT` (`1.00`) - If `BWP` is > `BWP_URGENT` an urgent alarm will be triggered.
    * `BWP_SNOOZE_MINS` (`10`) - minutes to snooze when there is enough IOB to cover a high BG.
    * `BWP_SNOOZE` - (`0.10`) If BG is higher then the `target_high` and `BWP` < `BWP_SNOOZE` alarms will be snoozed for `BWP_SNOOZE_MINS`.
  * `cage` (Cannula Age) - Calculates the number of hours since the last `Site Change` treatment that was recorded.
    * `CAGE_ENABLE_ALERTS` (`false`) - Set to `true` to enable notifications to remind you of upcoming cannula change.
    * `CAGE_INFO` (`44`) - If time since last `Site Change` matches `CAGE_INFO`, user will be warned of upcoming cannula change
    * `CAGE_WARN` (`48`) - If time since last `Site Change` matches `CAGE_WARN`, user will be alarmed to to change the cannula
    * `CAGE_URGENT` (`72`) - If time since last `Site Change` matches `CAGE_URGENT`, user will be issued a persistent warning of overdue change.
  * `treatmentnotify` (Treatment Notifications) - Generates notifications when a treatment has been entered and snoozes alarms minutes after a treatment.  Default snooze is 10 minutes, and can be set using the `TREATMENTNOTIFY_SNOOZE_MINS` [extended setting](#extended-settings).
  * `basal` (Basal Profile) - Adds the Basal pill visualization to display the basal rate for the current time.  Also enables the `bwp` plugin to calculate correction temp basal suggestions.  Uses the `basal` field from the [treatment profile](#treatment-profile).
  * `bridge` (Share2Nightscout bridge) - Glucose reading directly from the Share service, uses these extended settings:
    * `BRIDGE_USER_NAME` - Your user name for the Share service.
    * `BRIDGE_PASSWORD` - Your password for the Share service.
    * `BRIDGE_INTERVAL` (`150000` *2.5 minutes*) - The time to wait between each update.
    * `BRIDGE_MAX_COUNT` (`1`) - The maximum number of records to fetch per update.
    * `BRIDGE_FIRST_FETCH_COUNT` (`3`) - Changes max count during the very first update only.
    * `BRIDGE_MAX_FAILURES` (`3`) - How many failures before giving up.
    * `BRIDGE_MINUTES` (`1400`) - The time window to search for new data per update (default is one day in minutes).
  
 Also see [Pushover](#pushover) and [IFTTT Maker](#ifttt-maker).
 

#### Extended Settings
  Some plugins support additional configuration using extra environment variables.  These are prefixed with the name of the plugin and a `_`.  For example setting `MYPLUGIN_EXAMPLE_VALUE=1234` would make `extendedSettings.exampleValue` available to the `MYPLUGIN` plugin.

  Plugins only have access to their own extended settings, all the extended settings of client plugins will be sent to the browser.

#### Pushover
  In addition to the normal web based alarms, there is also support for [Pushover](https://pushover.net/) based alarms and notifications.

  To get started install the Pushover application on your iOS or Android device and create an account.

  Using that account login to [Pushover](https://pushover.net/), in the top left you’ll see your User Key, you’ll need this plus an application API Token/Key to complete this setup.

  You’ll need to [Create a Pushover Application](https://pushover.net/apps/build).  You only need to set the Application name, you can ignore all the other settings, but setting an Icon is a nice touch.  Maybe you'd like to use [this one](https://raw.githubusercontent.com/nightscout/cgm-remote-monitor/master/static/images/large.png)?

  Pushover is configured using the following Environment Variables:
  
    * `ENABLE` - `pushover` should be added to the list of plugin, for example: `ENABLE="pushover"`.
    * `PUSHOVER_API_TOKEN` - Used to enable pushover notifications, this token is specific to the application you create from in [Pushover](https://pushover.net/), ***[additional pushover information](#pushover)*** below.
    * `PUSHOVER_USER_KEY` - Your Pushover user key, can be found in the top left of the [Pushover](https://pushover.net/) site, this can also be a pushover delivery group key to send to a group rather than just a single user.  This also support a space delimited list of keys.
    * `PUSHOVER_ANNOUNCEMENT_KEY` - An optional Pushover user/group key, will be used for system wide user generated announcements.  If not defined this will fallback to `PUSHOVER_USER_KEY`.  A possible use for this is sending important messages and alarms to a CWD that you don't want to send all notification too.  This also support a space delimited list of keys.
    * `BASE_URL` - Used for pushover callbacks, usually the URL of your Nightscout site, use https when possible.
    * `API_SECRET` - Used for signing the pushover callback request for acknowledgments.
    
    For testing/development try [localtunnel](http://localtunnel.me/).

#### IFTTT Maker
 In addition to the normal web based alarms, and pushover, there is also integration for [IFTTT Maker](https://ifttt.com/maker).
  
 With Maker you are able to integrate with all the other [IFTTT Channels](https://ifttt.com/channels).  For example you can send a tweet when there is an alarm, change the color of hue light, send an email, send and sms, and so much more.
 
 1. Setup IFTTT account: [login](https://ifttt.com/login) or [create an account](https://ifttt.com/join)
 2. Find your secret key on the [maker page](https://ifttt.com/maker)
 3. Configure Nightscout by setting these environment variables:
  * `ENABLE` - `maker` should be added to the list of plugin, for example: `ENABLE="maker"`.
  * `MAKER_KEY` - Set this to your secret key that you located in step 2, for example: `MAKER_KEY="abcMyExampleabc123defjt1DeNSiftttmak-XQb69p"` This also support a space delimited list of keys.
  * `MAKER_ANNOUNCEMENT_KEY` - An optional Maker key, will be used for system wide user generated announcements.  If not defined this will fallback to `MAKER_KEY`.  A possible use for this is sending important messages and alarms to a CWD that you don't want to send all notification too.  This also support a space delimited list of keys.
 4. [Create a recipe](https://ifttt.com/myrecipes/personal/new) or see [more detailed instructions](lib/plugins/maker-setup.md#create-a-recipe)
 
 Plugins can create custom events, but all events sent to maker will be prefixed with `ns-`.  The core events are:
  * `ns-event` - This event is sent to the maker service for all alarms and notifications.  This is good catch all event for general logging.
  * `ns-allclear` - This event is sent to the maker service when an alarm has been ack'd or when the server starts up without triggering any alarms.  For example, you could use this event to turn a light to green.
  * `ns-info` - Plugins that generate notifications at the info level will cause this event to also be triggered.  It will be sent in addition to `ns-event`.
  * `ns-warning` - Alarms at the warning level with cause this event to also be triggered.  It will be sent in addition to `ns-event`.
  * `ns-urgent` - Alarms at the urgent level with cause this event to also be triggered.  It will be sent in addition to `ns-event`.
  * see the [full list of events](lib/plugins/maker-setup.md#events)


### Treatment Profile
  Some of the [plugins](#plugins) make use of a treatment profile that can be edited using the Profile Editor, see the link in the Settings drawer on your site.
  
  Treatment Profile Fields:

  * `timezone` (Time Zone) - time zone local to the patient. *Should be set.*
  * `units` (Profile Units) - blood glucose units used in the profile, either "mgdl" or "mmol"
  * `dia` (Insulin duration) - value should be the duration of insulin action to use in calculating how much insulin is left active. Defaults to 3 hours.
  * `carbs_hr` (Carbs per Hour) - The number of carbs that are processed per hour, for more information see [#DIYPS](http://diyps.org/2014/05/29/determining-your-carbohydrate-absorption-rate-diyps-lessons-learned/).
  * `carbratio` (Carb Ratio) - grams per unit of insulin.
  * `sens` (Insulin sensitivity) How much one unit of insulin will normally lower blood glucose.
  * `basal` The basal rate set on the pump.
  * `target_high` - Upper target for correction boluses.
  * `target_low` - Lower target for correction boluses.
  
  Some example profiles are [here](example-profiles.md).

## Setting environment variables
Easy to emulate on the commandline:

```bash
    echo 'MONGO_CONNECTION=mongodb://sally:sallypass@ds099999.mongolab.com:99999/nightscout' >> my.env
    echo 'MONGO_COLLECTION=entries' >> my.env
```

From now on you can run using
```bash
    $ env $(cat my.env) PORT=1337 node server.js
```

Your hosting provider probably has a way to set these through their GUI.

### Vagrant install

Optionally, use [Vagrant](https://www.vagrantup.com/) with the
included `Vagrantfile` and `setup.sh` to install OS and node packages to
a virtual machine.

```bash
host$ vagrant up
host$ vagrant ssh
vm$ setup.sh
```

The setup script will install OS packages then run `npm install`.

The Vagrant VM serves to your host machine only on 192.168.33.10, you can access
the web interface on [http://192.168.33.10:1337](http://192.168.33.10:1337)

More questions?
---------------

Feel free to [post an issue][issues], but read the [wiki][wiki] first.

[issues]: https://github.com/nightscout/cgm-remote-monitor/issues
[wiki]: https://github.com/nightscout/cgm-remote-monitor/wiki

License
---------------

[agpl-3]: http://www.gnu.org/licenses/agpl-3.0.txt

    cgm-remote-monitor - web app to broadcast cgm readings
    Copyright (C) 2015 The Nightscout Foundation, http://www.nightscoutfoundation.org.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
