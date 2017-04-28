import Ember from 'ember';

var c3 = window.c3;

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['c3-chart-component'],
  
  init() {
    this._super(...arguments);
  },

  // triggered when data is updated by didUpdateAttrs
  _reload() {
    const chart = this.get('c3chart');

    // if data should not be appended
    // e.g. when using a pie or donut chart
    if ( this.get('unloadDataBeforeChange') ) {
      chart.unload();
      // default animation is 350ms
      // t/f data must by loaded after unload animation (400)
      // or chart will not properly render
      later(this, function() {
        chart.load(
          // data, axis, color are only mutable elements
          this.get('data'),
          this.get('axis'),
          this.get('color')
        );
      }, 400);
    } else {
      chart.load(
        this.get('data'),
        this.get('axis'),
        this.get('color')
      );
    }
  },

  // triggered when component added by didInsertElement
  _setupc3() {
    // get all base c3 properties
    console.log(this);
    const chartConfig = this.getProperties(
      ['data','axis','regions','bar','pie','donut','gauge',
      'grid','legend','tooltip','subchart','zoom','point',
      'line','area','size','padding','color','transition']);

    // bind c3 chart to component's DOM element
    chartConfig.bindto = this.get('element');

    // emit events to controller
    callbacks.call(this);
    function callbacks() {
      const that = this;
      const c3events = [
        'oninit',
        'onrendered',
        'onmouseover',
        'onmouseout',
        'onresize',
        'onresized'
      ];
      c3events.forEach((event) => {
        chartConfig[event] = function() {
          that.sendAction(event, that);
        };
      });
    }

    // render the initial chart
    this.set('c3chart', c3.generate(chartConfig));
  },

  /***
   * Component lifecycle hooks to control rendering actions
   ***/

  didReceiveAttrs() {
    // if DOM is not ready when component is inserted,
    // rendering issues can occur
    // t/f use 'afterRender' property to ensure
    // state readiness
    try {
      Ember.run.scheduleOnce('afterRender', this, this._setupc3);
    } catch(err) {
      console.log(err);
    }
  },

  didUpdateAttrs() {
    // if data proprety is dependent on async relationships,
    // animations can cause buggy renders, therefore debounce
    // component update to ensure proper visualization
    Ember.run.debounce(this, this._reload, 360);
  },

  willDestroyElement() {
    // execute teardown method
    this._super();
    this.get('c3chart').destroy();
  }
});
