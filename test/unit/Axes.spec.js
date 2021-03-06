import Axes from "../../src/Axes.ts";
import {PanInput} from "../../src/inputType/PanInput.ts";

describe("Axes", function () {
  describe("Axes Test", function () {
    beforeEach(() => {
      this.inst = null;
    });
    afterEach(() => {
      if (this.inst) {
        this.inst.destroy();
        this.inst = null;
      }
    });

    it("should check a initialization empty value", () => {
      // Given
      // When
      this.inst = new Axes();
      // Then

      const defaultOptions = {
        easing: function easeOutCubic(x) {
          return 1 - Math.pow(1 - x, 3);
        },
        interruptable: true,
        minimumDuration: 0,
        maximumDuration: Infinity,
        deceleration: 0.0006,
      }
      
      expect(this.inst).to.be.exist;
      expect(defaultOptions.easing(0.5)).to.be.equal(this.inst.options.easing(0.5));
      expect(defaultOptions.easing(0.3)).to.be.equal(this.inst.options.easing(0.3));
      expect(defaultOptions.easing(0.1)).to.be.equal(this.inst.options.easing(0.1));
      expect(defaultOptions.easing(0.7)).to.be.equal(this.inst.options.easing(0.7));
      expect(defaultOptions.easing(0.9)).to.be.equal(this.inst.options.easing(0.9));
      expect(defaultOptions.interruptable).to.be.equal(this.inst.options.interruptable);
      expect(defaultOptions.minimumDuration).to.be.equal(this.inst.options.minimumDuration);
      expect(defaultOptions.maximumDuration).to.be.equal(this.inst.options.maximumDuration);
      expect(defaultOptions.deceleration).to.be.equal(this.inst.options.deceleration);
    });

    it("should check initialization status", () => {
      // Given
      // When
      this.inst = new Axes({
        x: {
          range: [0, 100],
          bounce: [30, 50],
          circular: true
        },
        otherX: {
          range: [-100, 100],
          bounce: 40,
          circular: [false, true]
        }
      }, {
        deceleration: 0.001
      });

      // Then
      expect(this.inst.axis.x.bounce).to.deep.equal([30, 50]);
      expect(this.inst.axis.x.circular).to.deep.equal([true, true]);
      expect(this.inst.axis.otherX.bounce).to.deep.equal([40, 40]);
      expect(this.inst.axis.otherX.circular).to.deep.equal([false, true]);
    });
    it("should check `setTo` method", () => {
      // Given
      this.inst = new Axes({
        x: {
          range: [0, 100],
          bounce: [30, 50],
          circular: true
        },
        otherX: {
          range: [-100, 100],
          bounce: 40,
          circular: [false, true]
        }
      }, {
        deceleration: 0.001
      });      
      // When
      let ret = this.inst.setTo({x: 20});

      // Then
      expect(this.inst.get()).to.be.eql({x: 20, otherX: -100});
      expect(ret).to.be.equal(this.inst);
    });

    it("should check `setTo` method (with duration)", () => {
      // Given
      const startHandler = sinon.spy();
      const changeHandler = sinon.spy();
      const endHandler = sinon.spy(function() {
        // Then
        expect(startHandler.callCount).to.be.equal(1);
        expect(changeHandler.called).to.be.true;
        expect(this.inst.get()).to.be.eql({x: 20, otherX: -100});
        done();
      });
      this.inst = new Axes({
        x: {
          range: [0, 100],
          bounce: [30, 50],
          circular: true
        },
        otherX: {
          range: [-100, 100],
          bounce: 40,
          circular: [false, true]
        }
      }, {
        deceleration: 0.001
      }).on({
        "animationStart": startHandler,
        "change": changeHandler,
        "animationEnd": endHandler
      });

      // When
      this.inst.setTo({x: 20}, 200);
    });    
  });

  describe("Axes Test with InputType", function () {
    beforeEach(() => {
      this.inst = new Axes({
        x: {
          range: [0, 100],
          bounce: [30, 50],
          circular: true
        },
        otherX: {
          range: [-100, 100],
          bounce: 40,
          circular: [false, true]
        }
      }, {
        deceleration: 0.001
      });
      sandbox();
    });
    afterEach(() => {
      if (this.inst) {
        this.inst.destroy();
        this.inst = null;
      }
      cleanup();
    });

    it("should check `connect` method", () => {
      // Given
      const input = new PanInput("#sandbox");

      // When
      let ret = this.inst.connect("x", input);

      // Then
      expect(input.axes).to.be.eql(["x"]);
      expect(this.inst._inputs.length).to.be.equal(1);
      expect(ret).to.be.equal(this.inst);

      // When
      ret = this.inst.connect(["x"], input);
      
      // Then
      expect(input.axes).to.be.eql(["x"]);
      expect(this.inst._inputs.length).to.be.equal(1);
      expect(ret).to.be.equal(this.inst);

      // When
      ret = this.inst.connect(["x", "y"], input);
      
      // Then
      expect(input.axes).to.be.eql(["x", "y"]);
      expect(this.inst._inputs.length).to.be.equal(1);
      expect(ret).to.be.equal(this.inst);

      // When
      ret = this.inst.connect("x y", input);
      
      // Then
      expect(input.axes).to.be.eql(["x", "y"]);
      expect(this.inst._inputs.length).to.be.equal(1);
      expect(ret).to.be.equal(this.inst);

      input.destroy();
    });

    it("should check `disconnect` method", () => {
      // Given
      const input1 = new PanInput("#sandbox");
      const input2 = new PanInput("#sandbox");
      const input3 = new PanInput("#sandbox");
      this.inst.connect("x", input1);
      this.inst.connect("y", input2);
      this.inst.connect("x y", input3);

      // When
      expect(this.inst._inputs.length).to.be.equal(3);
      let ret = this.inst.disconnect(input1);
      
      // Then
      expect(this.inst._inputs.indexOf(input1)).to.be.equal(-1);
      expect(this.inst._inputs.length).to.be.equal(2);
      expect(ret).to.be.equal(this.inst);

      // When
      ret = this.inst.disconnect();
      
      // Then
      expect(this.inst._inputs).to.be.eql([]);
      expect(ret).to.be.equal(this.inst);
      expect(this.inst._inputs.length).to.be.equal(0);

      input1.destroy();
      input2.destroy();
      input3.destroy();
    });

    it("should check if hammer instance is shared (diffrent instance, same element)", () => {
      // Given
      const input1 = new PanInput("#sandbox");
      const input2 = new PanInput("#sandbox");
      const input3 = new PanInput("#sandbox");
      this.inst.connect("x", input1);
      this.inst.connect("y", input2);
      this.inst.connect("x y", input3);

      // When
      expect(this.inst._inputs.length).to.be.equal(3);
      
      // Then
      expect(input1.hammer).to.be.equal(input2.hammer);
      expect(input3.hammer).to.be.equal(input2.hammer);
      expect(input1).to.be.not.equal(input2);
      expect(input2).to.be.not.equal(input3);
      expect(input3).to.be.not.equal(input1);
      expect(input1.element).to.be.equal(input2.element);
      expect(input1.element).to.be.equal(input2.element);

      input1.destroy();
      input2.destroy();
      input3.destroy();
    });
  });
  describe("Axes Custom Event Test with interruptable", function () {
    beforeEach(() => {
      this.inst = new Axes({
        x: {
          range: [0, 300],
          bounce: 100
        },
        y: {
          range: [0, 400],
          bounce: 100
        }
      }, {
        deceleration: 0.001,
        interruptable: false
      });
      this.el = sandbox();
      this.el.innerHTML = `<div id="area"
        style="position:relative; border:5px solid #444; width:300px; height:400px; color:#aaa; margin:0;box-sizing:content-box; z-index:9;"></div>`;
      const self = this.inst;
      this.preventedFn = function() {
        expect(self._itm._prevented).to.be.true;
      };
      this.notPreventedFn = function() {
        expect(self._itm._prevented).to.be.false;
      };
      this.input = new PanInput(this.el);
      this.inst.connect(["x", "y"], this.input);
    });
    afterEach(() => {
      if (this.inst) {
        this.inst.destroy();
        this.inst = null;
      }
      if (this.input) {
        this.input.destroy();
        this.input = null;
      }
      cleanup();
    });

    it("should check interrupt test when user's action is fast", (done) => {
      const holdHandler = sinon.spy(this.preventedFn);
      const changeHandler = sinon.spy(this.preventedFn);
      const releaseHandler = sinon.spy(this.preventedFn);
      const animationStartHandler = sinon.spy(this.preventedFn);       
      const animationEndHandler = sinon.spy(this.notPreventedFn);       
      this.inst.on({
          "hold": holdHandler,
          "change": changeHandler,
          "release": releaseHandler,
          "animationStart": animationStartHandler,
          "animationEnd": animationEndHandler
      });

      // when
      Simulator.gestures.pan(this.el, {
          pos: [0, 0],
          deltaX: 100,
          deltaY: 100,
          duration: 1000,
          easing: "linear"
      }, () => {
          // Then
          // for test custom event
          setTimeout(() => {
            expect(holdHandler.calledOnce).to.be.true;
            expect(changeHandler.called).to.be.true;
            expect(releaseHandler.calledOnce).to.be.true;
            expect(animationStartHandler.calledOnce).to.be.true;
            expect(animationEndHandler.calledOnce).to.be.true;
            done();
          }, 1000);    
      }); 
    });
  });
  describe("Axes Custom Event Test", function () {
    beforeEach(() => {
      this.inst = new Axes({
        x: {
          range: [0, 300],
          bounce: 100
        },
        y: {
          range: [0, 400],
          bounce: 100
        }
      }, {
        deceleration: 0.001
      });
      this.el = sandbox();
      this.el.innerHTML = `<div id="area"
        style="position:relative; border:5px solid #444; width:300px; height:400px; color:#aaa; margin:0;box-sizing:content-box; z-index:9;"></div>`;

      this.holdHandler = sinon.spy();
      this.releaseHandler = sinon.spy();
      this.animationStartHandler = sinon.spy();
      this.animationEndHandler = sinon.spy();

      this.input = new PanInput(this.el);
      this.inst.on({
        "hold": this.holdHandler,
        "release": this.releaseHandler,
        "animationStart": this.animationStartHandler,
        "animationEnd": this.animationEndHandler
      }).connect(["x", "y"], this.input);
    });
    afterEach(() => {
      if (this.inst) {
        this.inst.destroy();
        this.inst = null;
      }
      if (this.input) {
        this.input.destroy();
        this.input = null;
      }
      this.holdHandler.reset();
      this.releaseHandler.reset();
      this.animationStartHandler.reset();
      this.animationEndHandler.reset();
      cleanup();
    });

    it("should check slow movement test (no-velocity)", (done) => {
      // Given
      const changeHandler = sinon.spy();
      this.inst.on("change", changeHandler);

      // When
      Simulator.gestures.pan(this.el, {
        pos: [30, 30],
        deltaX: 10,
        deltaY: 10,
        duration: 3000,
        easing: "linear"
      }, () => {
        // Then
        const holdEvent = this.holdHandler.getCall(0).args[0];
        expect(this.holdHandler.calledOnce).to.be.true;
        expect(holdEvent.pos.x).to.be.equal(0);
        expect(holdEvent.pos.y).to.be.equal(0);
        expect(holdEvent.inputEvent.isFirst).to.be.true;
        expect(changeHandler.called).to.be.true;
        for(let i=0, len = changeHandler.callCount; i <len; i++) {
          expect(changeHandler.getCall(i).args[0].holding).to.be.true;
        }
        expect(this.releaseHandler.calledOnce).to.be.true;
        expect(this.inst.get()).to.be.eql({x: 10, y: 10});
        expect(this.animationStartHandler.called).to.be.false;
        expect(this.animationEndHandler.called).to.be.false;
        done();
      });
    });

    it("should check slow movement test (no-velocity), release outside", (done) => {
      // Given
      this.inst.on("change", (e) => {
        if(this.animationStartHandler.called) {
          expect(e.holding).to.be.false;
        } else {
          expect(e.holding).to.be.true;
        }
      });
      this.inst.options.maximumDuration = 200;

      // When
      Simulator.gestures.pan(this.el, {
        pos: [30, 30],
        deltaX: -50,
        deltaY: 10,
        duration: 3000,
        easing: "linear"
      }, () => {
        // Then
        // for test animation event
        setTimeout(() => {
          const holdEvent = this.holdHandler.getCall(0).args[0];
          expect(this.holdHandler.calledOnce).to.be.true;
          expect(holdEvent.pos.x).to.be.equal(0);
          expect(holdEvent.pos.y).to.be.equal(0);
          expect(holdEvent.inputEvent.isFirst).to.be.true;
          expect(this.releaseHandler.calledOnce).to.be.true;
          expect(this.inst.get()).to.be.eql({x: 0, y: 10});
          expect(this.animationStartHandler.called).to.be.true;
          expect(this.animationEndHandler.called).to.be.true;
          done();
        }, 500);
      });
    });
    
    it("should check fast movement test (velocity)", (done) => {
      // Given
      this.inst.on("change", (e) => {
        if(this.animationStartHandler.called) {
          expect(e.holding).to.be.false;
        } else {
          expect(e.holding).to.be.true;
        }
      });

      // When
      Simulator.gestures.pan(this.el, {
        pos: [0, 0],
        deltaX: 100,
        deltaY: 100,
        duration: 500,
        easing: "linear"
      }, () => {
        // Then
        // for test animation event
        setTimeout(() => {
          expect(this.holdHandler.calledOnce).to.be.true;
          expect(this.releaseHandler.calledOnce).to.be.true;
          expect(this.animationStartHandler.calledOnce).to.be.true;
          expect(this.animationEndHandler.calledOnce).to.be.true;
          done();
        }, 2000);
      });
    });
    it("should check movement test when stop method was called in 'animationStart' event", (done) => {
      // Given
      const holdHandler = sinon.spy();
      const changeHandler = sinon.spy(function(e) {
        if (animationStartHandler.called) {
          expect(e.holding).to.be.false;
        } else {
          expect(e.holding).to.be.true;
        }
      });
      const releaseHandler = sinon.spy();
      const animationStartHandler = sinon.spy(e => {
          e.stop();
          setTimeout(function() {
            e.done();
          }, e.duration);
      });       
      const animationEndHandler = sinon.spy(this.notPreventedFn);       
      this.inst.on({
          "hold": holdHandler,
          "change": changeHandler,
          "release": releaseHandler,
          "animationStart": animationStartHandler,
          "animationEnd": animationEndHandler
      });

      // When
      Simulator.gestures.pan(this.el, {
        pos: [30, 30],
        deltaX: 100,
        deltaY: 100,
        duration: 500,
        easing: "linear"
      }, () => {
          // Then
          // for test custom event
          setTimeout(() => {
              expect(holdHandler.calledOnce).to.be.true;
              expect(releaseHandler.calledOnce).to.be.true;
              expect(animationStartHandler.calledOnce).to.be.true;
              expect(animationEndHandler.calledOnce).to.be.true;
              done();
          }, 1000);    
      }); 
    });     
  });  
});