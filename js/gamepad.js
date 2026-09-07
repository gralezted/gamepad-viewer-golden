/**
 * The main Gamepad class - Modified with Pink DualSense support
 *
 * @class Gamepad
 */
class Gamepad {
    /**
     * Creates an instance of Gamepad.
     */
    constructor() {
        // cached DOM references
        this.$body = document.body;
        this.$instructions = document.querySelector("#instructions");
        this.$instructionsLink = this.$instructions.querySelector("button");
        this.$placeholder = document.querySelector("#placeholder");
        this.$gamepad = document.querySelector("#gamepad");
        this.$overlay = document.querySelector("#overlay");
        this.$gamepadSelect = document.querySelector("select[name=gamepad-id]");
        this.$skinSelect = document.querySelector("select[name=skin]");
        this.$backgroundSelect = document.querySelector(
            "select[name=background]",
        );
        this.$colorOverlay = this.$overlay.querySelector("#color");
        this.$colorSelect =
            this.$colorOverlay.querySelector("select[name=color]");
        this.$triggersOverlay = this.$overlay.querySelector("#triggers");
        this.$triggersSelect = this.$triggersOverlay.querySelector(
            "select[name=triggers]",
        );
        this.$helpPopout = document.querySelector("#help-popout");
        this.$gamepadList = document.querySelector("#gamepad-list");

        this.backgroundStyle = [
            "transparent",
            "checkered",
            "dimgrey",
            "black",
            "white",
            "lime",
            "magenta",
        ];
        this.textColors = [
            "black",
            "black",
            "black",
            "white",
            "black",
            "black",
            "black",
        ];
        this.haloColors = [
            "white",
            "white",
            "dimgrey",
            "black",
            "white",
            "lime",
            "magenta",
        ];

        // ensure the GamePad API is available on this browser
        this.assertGamepadAPI();

        this.initOverlaySelectors();

        // gamepad collection default values
        this.gamepads = {};
        this.identifiers = {
            // See: https://html5gamepad.com/codes
            debug: {
                id: /debug/,
                name: "Debug",
            },
            dualsense: {
                id: /0ce6/, // 0ce6 = DualSense controller product code
                name: "DualSense",
                colors: ["white", "black", "pink"],
                triggers: true,
            },
            ds4: {
                id: /054c|54c|09cc|046d|0810|2563/, // 054c = Sony vendor code, 046d,0810,2563 = PS-like controllers vendor codes
                name: "DualShock 4",
                colors: ["black", "white", "red", "blue"],
                triggers: true,
            },
            "xbox-one": {
                id: /045e|xinput|XInput/, // 045e = Microsoft vendor code, xinput = standard Windows controller
                name: "Xbox One",
                colors: ["black", "white"],
                triggers: true,
            },
        };

        // gamepad help default values
        this.instructionsTimeout = null;
        this.instructionsDelay = 5000;
        this.placeholderTimeout = null;
        this.placeholderDelay = 12000;
        this.overlayTimeout = null;
        this.overlayDelay = 5000;

        // active gamepad default values
        this.scanDelay = 50;
        this.isFirstscan = true;
        this.axisActivityThreshold = 0.5;
        this.activity = {};
        this.debug = false;
        this.index = null;
        this.disconnectedIndex = null;
        this.type = null;
        this.identifier = null;
        this.lastTimestamp = null;
        this.backgroundStyleIndex = 0;
        this.colorIndex = null;
        this.colorName = null;
        this.triggersMeter = false;
        this.zoomMode = "auto";
        this.zoomLevel = 1;
        this.updateButton = null;
        this.updateAxis = null;
        this.updateFrame = null;
        this.mapping = {
            buttons: [],
            axes: [],
        };

        // listen for gamepad related events
        this.haveEvents = "GamepadEvent" in window;
        if (this.haveEvents) {
            window.addEventListener(
                "gamepadconnected",
                this.onGamepadConnect.bind(this),
            );
            window.addEventListener(
                "gamepaddisconnected",
                this.onGamepadDisconnect.bind(this),
            );
        }

        // listen for mouse move events
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        // listen for keyboard events
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        // listen for keyboard events
        window.addEventListener("resize", this.onResize.bind(this));

        this.$instructionsLink.addEventListener("click", () =>
            this.toggleHelp(),
        );

        // bind a gamepads scan
        window.setInterval(this.scan.bind(this), this.scanDelay);

        // change the type if specified
        const skin = this.getUrlParam("type");
        if (skin) {
            this.changeSkin(skin);
        }

        // change the background if specified
        const background = this.getUrlParam("background");
        if (background) {
            const backgroundStyleIndex =
                this.backgroundStyle.indexOf(background);
            if (backgroundStyleIndex !== -1) {
                this.changeBackgroundStyle(backgroundStyleIndex);
            }
        }

        // by default, enqueue a delayed display of the placeholder animation
        if (this.getUrlParam("placeholder") !== "no") {
            this.displayPlaceholder();
        }
    }

    assertGamepadAPI() {
        const getGamepadsFn = navigator.getGamepads
            ? () => navigator.getGamepads()
            : navigator.webkitGetGamepads
              ? () => navigator.webkitGetGamepads()
              : null;
        if (!getGamepadsFn) {
            this.$body.classList.add("unsupported");
            throw new Error("Unsupported gamepad API");
        }
        this.getNavigatorGamepads = getGamepadsFn;
    }

    show($element) {
        this.stopFade($element);
        $element.style.opacity = "";
        $element.classList.remove("hidden");
    }

    hide($element) {
        this.stopFade($element);
        $element.style.opacity = "";
        $element.classList.add("hidden");
    }

    fadeIn($element) {
        this.stopFade($element);
        $element.classList.remove("hidden");
        $element._fade = $element.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 400,
        });
        $element._fade.onfinish = () => {
            $element.style.opacity = "";
            $element._fade = null;
        };
    }

    fadeOut($element) {
        this.stopFade($element);
        $element._fade = $element.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 400,
        });
        $element._fade.onfinish = () => {
            $element.style.opacity = "";
            $element.classList.add("hidden");
            $element._fade = null;
        };
    }

    stopFade($element) {
        if ($element._fade) {
            $element._fade.cancel();
            $element._fade = null;
        }
    }

    initOverlaySelectors() {
        this.$gamepadSelect.addEventListener("change", () =>
            this.changeGamepad(this.$gamepadSelect.value),
        );
        this.$skinSelect.addEventListener("change", () =>
            this.changeSkin(this.$skinSelect.value),
        );
        this.$backgroundSelect.addEventListener("change", () =>
            this.changeBackgroundStyle(this.$backgroundSelect.value),
        );
        this.$colorSelect.addEventListener("change", () =>
            this.changeGamepadColor(this.$colorSelect.value),
        );
        this.$triggersSelect.addEventListener("change", () =>
            this.toggleTriggersMeter(this.$triggersSelect.value === "meter"),
        );
    }

    displayInstructions() {
        if (null !== this.index) return;
        window.clearTimeout(this.instructionsTimeout);
        this.show(this.$instructions);
        this.hideInstructions();
    }

    hideInstructions(hideNow = false) {
        window.clearTimeout(this.instructionsTimeout);
        if (hideNow) {
            this.hide(this.$instructions);
        }
        this.instructionsTimeout = window.setTimeout(() => {
            this.fadeOut(this.$instructions);
        }, this.instructionsDelay);
    }

    displayPlaceholder() {
        if (null !== this.index) return;
        window.clearTimeout(this.placeholderTimeout);
        this.show(this.$placeholder);
        this.hidePlaceholder();
    }

    hidePlaceholder(hideNow = false) {
        window.clearTimeout(this.placeholderTimeout);
        if (hideNow) {
            this.hide(this.$placeholder);
        }
        this.placeholderTimeout = window.setTimeout(() => {
            this.fadeOut(this.$placeholder);
        }, this.placeholderDelay);
    }

    togglePlaceholder() {
        let placeholder = this.getUrlParam("placeholder");
        switch (placeholder) {
            case "yes":
                placeholder = "no";
                break;
            case "no":
                placeholder = undefined;
                break;
            default:
                placeholder = "yes";
                break;
        }
        this.updateUrlParams({ placeholder });
        if (placeholder === "no") {
            this.hidePlaceholder(true);
        } else {
            this.displayPlaceholder();
        }
    }

    displayOverlay() {
        window.clearTimeout(this.overlayTimeout);
        this.show(this.$overlay);
        this.hideOverlay();
    }

    hideOverlay(hideNow = false) {
        window.clearTimeout(this.overlayTimeout);
        if (hideNow) {
            this.hide(this.$overlay);
        }
        this.overlayTimeout = window.setTimeout(() => {
            this.fadeOut(this.$overlay);
        }, this.overlayDelay);
    }

    updateColors() {
        if (!this.type) {
            this.hide(this.$colorOverlay);
            return;
        }
        const colors = this.identifiers[this.type].colors;
        if (!colors) {
            this.hide(this.$colorOverlay);
            return;
        }
        this.$colorSelect.innerHTML = colors
            .map((color) => `<option value="${color}">${color}</option>`)
            .join("");
        this.fadeIn(this.$colorOverlay);
    }

    updateTriggers() {
        if (!this.type) {
            this.hide(this.$triggersOverlay);
            return;
        }
        const triggers = this.identifiers[this.type].triggers;
        if (!triggers) {
            this.hide(this.$triggersOverlay);
            return;
        }
        this.fadeIn(this.$triggersOverlay);
    }

    onGamepadConnect() {
        this.pollGamepads();
        this.updateGamepadList();
        if (this.helpVisible) this.buildHelpGamepadList();
    }

    onGamepadDisconnect(e) {
        this.pollGamepads();
        this.updateGamepadList();
        if (e.gamepad.index === this.index) {
            this.$gamepad.classList.add("disconnected");
            this.disconnectedIndex = e.gamepad.index;
        }
        if (this.helpVisible) this.buildHelpGamepadList();
    }

    onMouseMove() {
        this.displayInterface();
    }

    displayInterface() {
        this.displayInstructions();
        this.displayPlaceholder();
        this.displayOverlay();
    }

    onKeyDown(e) {
        this.displayInterface();
        switch (e.code) {
            case "Delete":
                this.clear();
                this.displayPlaceholder();
                break;
            case "Escape":
                if (this.helpVisible) {
                    this.toggleHelp();
                    break;
                }
                this.clear();
                this.displayPlaceholder();
                break;
            case "KeyB":
                this.changeBackgroundStyle();
                break;
            case "KeyC":
                this.changeGamepadColor();
                break;
            case "KeyD":
                this.toggleDebug();
                break;
            case "KeyG":
                this.toggleGamepadType();
                break;
            case "KeyH":
                this.toggleHelp();
                break;
            case "KeyP":
                this.togglePlaceholder();
                break;
            case "KeyT":
                this.toggleTriggersMeter();
                break;
            case "NumpadAdd":
            case "Equal":
                this.changeZoom("+");
                break;
            case "NumpadSubtract":
            case "Minus":
                this.changeZoom("-");
                break;
            case "Numpad5":
            case "Digit5":
                this.changeZoom("auto");
                break;
            case "Numpad0":
            case "Digit0":
                this.changeZoom(0);
                break;
        }
    }

    onResize() {
        if (this.zoomMode === "auto") this.changeZoom("auto");
    }

    pollGamepads() {
        this.gamepads = this.getNavigatorGamepads();
    }

    buildHelpGamepadList() {
        this.pollGamepads();
        const $rows = [];
        for (let key = 0; key < this.gamepads.length; key++) {
            const gamepad = this.gamepads[key];
            if (!gamepad) continue;
            const $row = document.createElement("tr");
            const $index = document.createElement("td");
            $index.textContent = gamepad.index;
            const $id = document.createElement("td");
            $id.textContent = gamepad.id;
            $row.append($index, $id);
            $rows.push($row);
        }
        this.$gamepadList.replaceChildren();
        if ($rows.length === 0) {
            const $row = document.createElement("tr");
            const $cell = document.createElement("td");
            $cell.colSpan = 2;
            $cell.textContent = "No gamepad detected.";
            $row.append($cell);
            $rows.push($row);
        }
        this.$gamepadList.append(...$rows);
    }

    toGamepadName(id) {
        const chrome =
            /^(?<name>.*) \((?:.*?Vendor: [0-9a-f]{4} Product: [0-9a-f]{4}|.*)\)$/i.exec(
                id,
            );
        if (chrome) return chrome.groups.name;
        const firefox = /^[0-9a-f]{4}-[0-9a-f]{4}-(?<name>.*)$/i.exec(id);
        if (firefox) return firefox.groups.name;
        return id;
    }

    updateGamepadList() {
        for (const $entry of this.$gamepadSelect.querySelectorAll(".entry")) {
            $entry.remove();
        }
        for (let index = 0; index < this.gamepads.length; index++) {
            const gamepad = this.gamepads[index];
            if (!gamepad) continue;
            const $option = document.createElement("option");
            $option.className = "entry";
            $option.value = gamepad.id;
            $option.textContent = this.toGamepadName(gamepad.id);
            this.$gamepadSelect.append($option);
        }
    }

    changeGamepad(id) {
        this.pollGamepads();
        const index = this.gamepads.findIndex((g) => g && id === g.id);
        this.updateUrlParams({ gamepad: id !== "auto" ? id : undefined });
        if (index === -1) {
            this.clear();
        } else {
            this.map(index);
        }
    }

    getActive() {
        return this.gamepads[this.index];
    }

    getType(gamepad) {
        const type = this.getUrlParam("type");
        if (type === "debug") this.debug = true;
        if (this.debug) return "debug";
        if (type) return this.identifiers[type] ? type : null;
        for (const gamepadType in this.identifiers) {
            if (this.identifiers[gamepadType].id.test(gamepad.id)) {
                return gamepadType;
            }
        }
        return "xbox-one";
    }

    scan() {
        if (null !== this.index && null === this.disconnectedIndex) return;
        this.pollGamepads();
        if (this.isFirstscan) {
            this.updateGamepadList();
            this.isFirstscan = false;
        }
        for (let index = 0; index < this.gamepads.length; index++) {
            if (
                null !== this.disconnectedIndex &&
                index !== this.disconnectedIndex
            )
                continue;
            const gamepad = this.gamepads[index];
            if (!gamepad) continue;
            if (this.getUrlParam("gamepad") === gamepad.id) {
                this.map(gamepad.index);
                return;
            }
            if (!this.hasNewActivity(gamepad)) continue;
            this.map(gamepad.index);
            if (gamepad.vibrationActuator) {
                gamepad.vibrationActuator.playEffect(
                    gamepad.vibrationActuator.type,
                    {
                        duration: 100,
                        strongMagnitude: 0.2,
                        weakMagnitude: 1,
                        startDelay: 0,
                    },
                );
            }
            return;
        }
    }

    hasNewActivity(gamepad) {
        const previous = this.activity[gamepad.index];
        const buttons = [];
        const axes = [];
        let isActive = false;
        for (let index = 0; index < gamepad.buttons.length; index++) {
            buttons[index] = gamepad.buttons[index].pressed;
            if (previous && buttons[index] && !previous.buttons[index]) {
                isActive = true;
            }
        }
        for (let index = 0; index < gamepad.axes.length; index++) {
            axes[index] =
                Math.abs(gamepad.axes[index]) > this.axisActivityThreshold;
            if (previous && axes[index] && !previous.axes[index]) {
                isActive = true;
            }
        }
        this.activity[gamepad.index] = { buttons, axes };
        return isActive;
    }

    map(index) {
        if ("undefined" === typeof index) return;
        this.hideInstructions(true);
        this.$helpPopout.classList.remove("active");
        this.hidePlaceholder(true);
        this.index = index;
        this.disconnectedIndex = null;
        this.$gamepad.classList.remove("disconnected");
        const gamepad = this.getActive();
        if (!gamepad) {
            this.index = null;
            this.displayPlaceholder(true);
            return;
        }
        this.type = this.getType(gamepad);
        if (!this.type) return;
        this.identifier = this.identifiers[this.type];
        const gamepadId = this.getUrlParam("gamepad");
        if (gamepadId) {
            this.$gamepadSelect.value = gamepadId;
        }
        this.updateColors();
        this.updateTriggers();
        this.loadTemplate(gamepad);
        this.hideInstructions();
        this.hidePlaceholder();
    }

    clear() {
        if (this.index === null) return;
        this.index = null;
        this.disconnectedIndex = null;
        this.debug = false;
        this.lastTimestamp = null;
        this.type = null;
        this.identifier = null;
        this.colorIndex = null;
        this.colorName = null;
        this.zoomLevel = 1;
        this.updateButton = null;
        this.updateAxis = null;
        this.updateFrame = null;
        this.$gamepad.replaceChildren();
        this.$gamepadSelect.value = "auto";
        this.updateColors();
        this.updateTriggers();
        this.clearUrlParams();
    }

    loadTemplate(gamepad) {
        this.hide(this.$gamepad);
        this.updateButton = null;
        this.updateAxis = null;
        this.updateFrame = null;
        fetch(`templates/${this.type}/template.html`)
            .then((response) => response.text())
            .then(async (template) => {
                this.$gamepad.innerHTML = template;
                await this.runTemplateScripts(this.$gamepad);
                this.changeGamepadColor(this.getUrlParam("color"));
                this.toggleTriggersMeter(
                    this.getUrlParam("triggers") === "meter",
                );
                window.setTimeout(() =>
                    this.changeZoom(
                        this.type === "debug"
                            ? "auto"
                            : this.getUrlParam("zoom") || "auto",
                    ),
                );
                this.mapping.buttons = [];
                for (let index = 0; index < gamepad.buttons.length; index++) {
                    this.mapping.buttons[index] =
                        this.$gamepad.querySelectorAll(
                            `[data-button="${index}"]`,
                        );
                }
                this.mapping.axes = [];
                for (let index = 0; index < gamepad.axes.length; index++) {
                    this.mapping.axes[index] = this.$gamepad.querySelectorAll(
                        `[data-axis="${index}"], [data-axis-x="${index}"], [data-axis-y="${index}"], [data-axis-z="${index}"]`,
                    );
                }
                this.pollStatus(true);
                this.fadeIn(this.$gamepad);
            });
    }

    runTemplateScripts($container) {
        const scripts = Array.from($container.querySelectorAll("script"));
        return scripts.reduce(
            (chain, $old) =>
                chain.then(
                    () =>
                        new Promise((resolve, reject) => {
                            const $script = document.createElement("script");
                            for (const { name, value } of $old.attributes) {
                                if (name === "async") continue;
                                $script.setAttribute(name, value);
                            }
                            $script.textContent = $old.textContent;
                            if ($old.src) {
                                $script.onload = resolve;
                                $script.onerror = reject;
                                $old.replaceWith($script);
                            } else {
                                $old.replaceWith($script);
                                resolve();
                            }
                        }),
                ),
            Promise.resolve(),
        );
    }

    pollStatus(force = false) {
        if (this.index === null) return;
        if (this.disconnectedIndex !== null) return;
        window.requestAnimationFrame(() => this.pollStatus());
        this.pollGamepads();
        const activeGamepad = this.getActive();
        if (!activeGamepad) return;
        if (!force && activeGamepad.timestamp === this.lastTimestamp) return;
        this.lastTimestamp = activeGamepad.timestamp;
        this.updateButtons(activeGamepad);
        this.updateAxes(activeGamepad);
        if ("function" === typeof this.updateFrame) {
            this.updateFrame(activeGamepad);
        }
    }

    setValue($element, name, value) {
        const string = String(value);
        if ($element.getAttribute(name) !== string) {
            $element.setAttribute(name, string);
        }
    }

    updateButtons(gamepad) {
        for (let index = 0; index < gamepad.buttons.length; index++) {
            const $buttons = this.mapping.buttons[index];
            if (!$buttons?.length) continue;
            const button = gamepad.buttons[index];
            $buttons.forEach(($button) => {
                this.setValue($button, "data-pressed", button.pressed);
                this.setValue($button, "data-value", button.value);
                if ("function" === typeof this.updateButton) {
                    this.updateButton($button);
                }
            });
        }
    }

    updateAxes(gamepad) {
        for (let index = 0; index < gamepad.axes.length; index++) {
            const $axes = this.mapping.axes[index];
            if (!$axes?.length) continue;
            const axis = gamepad.axes[index];
            $axes.forEach(($axis) => {
                if ($axis.matches(`[data-axis="${index}"]`)) {
                    this.setValue($axis, "data-value", axis);
                }
                if ($axis.matches(`[data-axis-x="${index}"]`)) {
                    this.setValue($axis, "data-value-x", axis);
                }
                if ($axis.matches(`[data-axis-y="${index}"]`)) {
                    this.setValue($axis, "data-value-y", axis);
                }
                if ($axis.matches(`[data-axis-z="${index}"]`)) {
                    this.setValue($axis, "data-value-z", axis);
                }
                if ("function" === typeof this.updateAxis) {
                    this.updateAxis($axis);
                }
            });
        }
    }

    changeSkin(skin) {
        this.$skinSelect.value = skin;
        this.debug = skin === "debug";
        this.updateUrlParams({ type: skin !== "auto" ? skin : undefined });
        this.map(this.index);
    }

    changeBackgroundStyle(style) {
        if ("undefined" === typeof style) {
            this.backgroundStyleIndex =
                (this.backgroundStyleIndex + 1) % this.backgroundStyle.length;
        } else if ("string" === typeof style) {
            this.backgroundStyleIndex = this.backgroundStyle.indexOf(style);
        } else {
            this.backgroundStyleIndex = style;
        }
        this.backgroundStyleName =
            this.backgroundStyle[this.backgroundStyleIndex];
        this.$body.style.background =
            this.backgroundStyleName === "checkered"
                ? "url(css/transparent-bg.png)"
                : this.backgroundStyleName;
        this.$body.style.color = this.textColors[this.backgroundStyleIndex];
        this.$body.style.setProperty(
            "--gv-halo",
            this.haloColors[this.backgroundStyleIndex],
        );
        this.updateUrlParams({ background: this.backgroundStyleName });
        this.$backgroundSelect.value = this.backgroundStyleName;
    }

    changeGamepadColor(color) {
        if (this.index === null) return;
        const colors = this.identifier.colors;
        if (!colors) return;
        if ("undefined" === typeof color) {
            this.colorIndex = (this.colorIndex + 1) % colors.length;
        } else {
            const index = colors.indexOf(color);
            this.colorIndex = index === -1 ? 0 : index;
        }
        this.colorName = colors[this.colorIndex];
        this.$gamepad.setAttribute("data-color", this.colorName);
        this.updateUrlParams({ color: this.colorName });
        this.$colorSelect.value = this.colorName;
    }

    changeZoom(level) {
        if (this.index === null) return;
        if (typeof level === "undefined") return;
        this.zoomMode = level === "auto" ? "auto" : "manual";
        if (this.zoomMode === "auto") {
            this.zoomLevel = Math.min(
                window.innerWidth / this.$gamepad.offsetWidth,
                window.innerHeight / this.$gamepad.offsetHeight,
                1,
            );
        } else if (level === 0) {
            this.zoomLevel = 1;
        } else if (level === "+" && this.zoomLevel < 2) {
            this.zoomLevel += 0.1;
        } else if (level === "-" && this.zoomLevel > 0.1) {
            this.zoomLevel -= 0.1;
        } else {
            const parsed = parseFloat(level);
            if (!Number.isNaN(parsed)) {
                this.zoomLevel = parsed;
            }
        }
        this.zoomLevel = +this.zoomLevel.toFixed(2);
        this.$gamepad.style.transform = `translate(-50%, -50%) scale(${this.zoomLevel}, ${this.zoomLevel})`;
        this.updateUrlParams({
            zoom: this.zoomMode === "auto" ? undefined : this.zoomLevel,
        });
    }

    toggleGamepadType() {
        if (this.index === null || this.type === null) return;
        this.debug = false;
        const types = Object.keys(this.identifiers).filter(
            (i) => i !== "debug",
        );
        let typeIndex = types.reduce((typeIndex, type, index) => {
            return type === this.type ? index : typeIndex;
        }, 0);
        this.type = types[++typeIndex >= types.length ? 0 : typeIndex];
        this.updateUrlParams({ type: this.type });
        this.map(this.index);
    }

    toggleDebug(debug = null) {
        if (this.index === null) return;
        this.debug = debug !== null ? debug : !this.debug;
        this.changeSkin(this.debug ? "debug" : "auto");
    }

    toggleHelp() {
        this.buildHelpGamepadList();
        this.$helpPopout.classList.toggle("active");
        this.helpVisible = this.$helpPopout.classList.contains("active");
    }

    toggleTriggersMeter(useMeter) {
        if (this.index === null) return;
        this.triggersMeter =
            useMeter !== undefined ? useMeter : !this.triggersMeter;
        this.$gamepad.classList.toggle("triggers-meter", this.triggersMeter);
        const triggers = this.triggersMeter ? "meter" : "opacity";
        this.updateUrlParams({ triggers });
        this.$triggersSelect.value = triggers;
    }

    getUrlParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    updateUrlParams(newParams) {
        const params = new URLSearchParams(window.location.search);
        for (const [key, value] of Object.entries(newParams)) {
            if (value === undefined || value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        const query = params.toString();
        window.history.replaceState(
            {},
            document.title,
            query
                ? `${window.location.pathname}?${query}`
                : window.location.pathname,
        );
    }

    clearUrlParams() {
        this.updateUrlParams({
            type: undefined,
            color: undefined,
            debug: undefined,
            triggers: undefined,
            zoom: undefined,
        });
    }
}

window.gamepad = new Gamepad();
