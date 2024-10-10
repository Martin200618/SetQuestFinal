var VanillaTilt = (function () {
    'use strict';
  
    class VanillaTilt {
      constructor(element, settings = {}) {
        if (!(element instanceof Node)) {
          throw new Error("Can't initialize VanillaTilt because " + element + " is not a Node.");
        }
  
        this.width = null;
        this.height = null;
        this.clientWidth = null;
        this.clientHeight = null;
        this.left = null;
        this.top = null;
  
        // for Gyroscope sampling
        this.gammazero = null;
        this.betazero = null;
        this.lastgammazero = null;
        this.lastbetazero = null;
  
        this.transitionTimeout = null;
        this.updateCall = null;
        this.event = null;
  
        this.updateBind = this.update.bind(this);
        this.resetBind = this.reset.bind(this);
  
        this.element = element;
        this.settings = this.extendSettings(settings);
  
        this.reverse = this.settings.reverse ? -1 : 1;
        this.resetToStart = VanillaTilt.isSettingTrue(this.settings["reset-to-start"]);
        this.glare = VanillaTilt.isSettingTrue(this.settings.glare);
        this.glarePrerender = VanillaTilt.isSettingTrue(this.settings["glare-prerender"]);
        this.fullPageListening = VanillaTilt.isSettingTrue(this.settings["full-page-listening"]);
        this.gyroscope = VanillaTilt.isSettingTrue(this.settings.gyroscope);
        this.gyroscopeSamples = this.settings.gyroscopeSamples;
  
        this.elementListener = this.getElementListener();
  
        if (this.glare) {
          this.prepareGlare();
        }
  
        if (this.fullPageListening) {
          this.updateClientSize();
        }
  
        this.addEventListeners();
        this.reset();
  
        if (this.resetToStart === false) {
          this.settings.startX = 0;
          this.settings.startY = 0;
        }
      }
  
      static isSettingTrue(setting) {
        return setting === "" || setting === true || setting === 1;
      }
  
      getElementListener() {
        if (this.fullPageListening) {
          return window.document;
        }
  
        if (typeof this.settings["mouse-event-element"] === "string") {
          const mouseEventElement = document.querySelector(this.settings["mouse-event-element"]);
  
          if (mouseEventElement) {
            return mouseEventElement;
          }
        }
  
        if (this.settings["mouse-event-element"] instanceof Node) {
          return this.settings["mouse-event-element"];
        }
  
        return this.element;
      }
  
      addEventListeners() {
        this.onMouseEnterBind = this.onMouseEnter.bind(this);
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseLeaveBind = this.onMouseLeave.bind(this);
        this.onWindowResizeBind = this.onWindowResize.bind(this);
        this.onDeviceOrientationBind = this.onDeviceOrientation.bind(this);
  
        this.elementListener.addEventListener("mouseenter", this.onMouseEnterBind);
        this.elementListener.addEventListener("mouseleave", this.onMouseLeaveBind);
        this.elementListener.addEventListener("mousemove", this.onMouseMoveBind);
  
        if (this.glare || this.fullPageListening) {
          window.addEventListener("resize", this.onWindowResizeBind);
        }
  
        if (this.gyroscope) {
          window.addEventListener("deviceorientation", this.onDeviceOrientationBind);
        }
      }
  
      removeEventListeners() {
        this.elementListener.removeEventListener("mouseenter", this.onMouseEnterBind);
        this.elementListener.removeEventListener("mouseleave", this.onMouseLeaveBind);
        this.elementListener.removeEventListener("mousemove", this.onMouseMoveBind);
  
        if (this.gyroscope) {
          window.removeEventListener("deviceorientation", this.onDeviceOrientationBind);
        }
  
        if (this.glare || this.fullPageListening) {
          window.removeEventListener("resize", this.onWindowResizeBind);
        }
      }
  
      destroy() {
        clearTimeout(this.transitionTimeout);
        if (this.updateCall !== null) {
          cancelAnimationFrame(this.updateCall);
        }
  
        this.element.style.willChange = "";
        this.element.style.transition = "";
        this.element.style.transform = "";
        this.resetGlare();
  
        this.removeEventListeners();
        this.element.vanillaTilt = null;
        delete this.element.vanillaTilt;
  
        this.element = null;
      }
  
      onDeviceOrientation(event) {
        if (event.gamma === null || event.beta === null) {
          return;
        }
  
        this.updateElementPosition();
  
        if (this.gyroscopeSamples > 0) {
          this.lastgammazero = this.gammazero;
          this.lastbetazero = this.betazero;
  
          if (this.gammazero === null) {
            this.gammazero = event.gamma;
            this.betazero = event.beta;
          } else {
            this.gammazero = (event.gamma + this.lastgammazero) / 2;
            this.betazero = (event.beta + this.lastbetazero) / 2;
          }
  
          this.gyroscopeSamples -= 1;
        }
  
        const totalAngleX = this.settings.gyroscopeMaxAngleX - this.settings.gyroscopeMinAngleX;
        const totalAngleY = this.settings.gyroscopeMaxAngleY - this.settings.gyroscopeMinAngleY;
  
        const degreesPerPixelX = totalAngleX / this.width;
        const degreesPerPixelY = totalAngleY / this.height;
  
        const angleX = event.gamma - (this.settings.gyroscopeMinAngleX + this.gammazero);
        const angleY = event.beta - (this.settings.gyroscopeMinAngleY + this.betazero);
  
        const posX = angleX / degreesPerPixelX;
        const posY = angleY / degreesPerPixelY;
  
        if (this.updateCall !== null) {
          cancelAnimationFrame(this.updateCall);
        }
  
        this.event = {
          clientX: posX + this.left,
          clientY: posY + this.top,
        };
  
        this.updateCall = requestAnimationFrame(this.updateBind);
      }
  
      onMouseEnter() {
        this.updateElementPosition();
        this.element.style.willChange = "transform";
        this.setTransition();
      }
  
      onMouseMove(event) {
        if (this.updateCall !== null) {
          cancelAnimationFrame(this.updateCall);
        }
  
        this.event = event;
        this.updateCall = requestAnimationFrame(this.updateBind);
      }
  
      onMouseLeave() {
        this.setTransition();
  
        if (this.settings.reset) {
          requestAnimationFrame(this.resetBind);
        }
      }
  
      reset() {
        this.onMouseEnter();
  
        if (this.fullPageListening) {
          this.event = {
            clientX: (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.clientWidth,
            clientY: (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.clientHeight
          };
        } else {
          this.event = {
            clientX: this.left + ((this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.width),
            clientY: this.top + ((this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.height)
          };
        }
  
        let backupScale = this.settings.scale;
        this.settings.scale = 1;
        this.update();
        this.settings.scale = backupScale;
        this.resetGlare();
      }
  
      resetGlare() {
        if (this.glare) {
          this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
          this.glareElement.style.opacity = "0";
        }
      }
  
      getValues() {
        let x, y;
  
        if (this.fullPageListening) {
          x = this.event.clientX / this.clientWidth;
          y = this.event.clientY / this.clientHeight;
        } else {
          x = (this.event.clientX - this.left) / this.width;
          y = (this.event.clientY - this.top) / this.height;
        }
  
        x = Math.min(Math.max(x, 0), 1);
        y = Math.min(Math.max(y, 0), 1);
  
        let tiltX = (this.reverse * (this.settings.max - x * this.settings.max * 2)).toFixed(2);
        let tiltY = (this.reverse * (y * this.settings.max * 2 - this.settings.max)).toFixed(2);
        let angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);
  
        return {
          tiltX: tiltX,
          tiltY: tiltY,
          percentageX: x * 100,
          percentageY: y * 100,
          angle: angle
        };
      }
  
      updateElementPosition() {
        let rect = this.element.getBoundingClientRect();
  
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.left = rect.left;
        this.top = rect.top;
      }
  
      update() {
        let values = this.getValues();
  
        this.element.style.transform = "perspective(" + this.settings.perspective + "px) " +
          "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " +
          "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " +
          "scale(" + this.settings.scale + ")";
  
        if (this.glare) {
          this.glareElement.style.transform = "rotate(" + values.angle + "deg) translate(-50%, -50%)";
          this.glareElement.style.opacity = `${values.percentageY * this.settings.glareMaxOpacity / 100}`;
        }
      }
  
      setTransition() {
        clearTimeout(this.transitionTimeout);
        this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
  
        this.transitionTimeout = setTimeout(() => {
          this.element.style.transition = "";
        }, this.settings.speed);
      }
  
      prepareGlare() {
        if (!this.glarePrerender) {
          const glareWrapper = document.createElement("div");
          const glareElement = document.createElement("div");
  
          glareWrapper.classList.add("vanilla-tilt-glare");
          glareElement.classList.add("vanilla-tilt-glare-inner");
  
          glareWrapper.appendChild(glareElement);
          this.element.appendChild(glareWrapper);
        }
  
        this.glareElement = this.element.querySelector(".vanilla-tilt-glare-inner");
        this.glareElement.style.position = "absolute";
        this.glareElement.style.top = "0";
        this.glareElement.style.left = "0";
        this.glareElement.style.width = "100%";
        this.glareElement.style.height = "100%";
        this.glareElement.style.pointerEvents = "none";
        this.glareElement.style.opacity = "0";
        this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
  
        Object.assign(this.glareElement.style, {
          "background-image": "linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
        });
  
        this.glareElement.style.transition = "opacity " + this.settings.speed + "ms " + this.settings.easing;
      }
  
      updateClientSize() {
        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
      }
  
      extendSettings(settings) {
        const defaultSettings = {
          perspective: 1000,
          scale: 1,
          speed: 300,
          transition: true,
          easing: "cubic-bezier(.03,.98,.52,.99)",
          max: 15,
          glare: false,
          "max-glare": 1,
          glarePrerender: false,
          "reset-to-start": true,
          "full-page-listening": false,
          "mouse-event-element": null,
          gyroscope: false,
          gyroscopeMaxAngleX: 30,
          gyroscopeMinAngleX: -30,
          gyroscopeMaxAngleY: 30,
          gyroscopeMinAngleY: -30,
          gyroscopeSamples: 10,
          axis: null,
          reverse: false,
        };
  
        for (const key in defaultSettings) {
          if (settings[key] === undefined) {
            settings[key] = defaultSettings[key];
          }
        }
  
        return settings;
      }
    }
  
    return VanillaTilt;
  })();
  
  if (typeof document !== "undefined") {
    const vanillaTiltElements = document.querySelectorAll("[data-tilt]");
  
    vanillaTiltElements.forEach(function (element) {
      const settings = {};
  
      for (const key in element.dataset) {
        settings[key] = element.dataset[key];
      }
  
      new VanillaTilt(element, settings);
    });
  }

  
  