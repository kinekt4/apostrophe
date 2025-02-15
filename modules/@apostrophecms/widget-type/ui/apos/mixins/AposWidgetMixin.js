import { isEqual } from 'lodash';

export default {
  props: {
    docId: String,
    type: String,
    areaFieldId: String,
    value: Object,
    rendering: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  watch: {
    value: {
      handler() {
        this.renderContent();
      }
    }
  },
  data() {
    return {
      rendered: '...'
    };
  },
  mounted() {
    this.renderContent();
  },
  computed: {
    moduleOptions() {
      return apos.modules[apos.area.widgetManagers[this.type]];
    }
  },
  methods: {
    async renderContent() {
      apos.bus.$emit('widget-rendering');
      const parameters = {
        _docId: this.docId,
        widget: this.value,
        areaFieldId: this.areaFieldId,
        type: this.type
      };
      try {
        if (this.rendering && (isEqual(this.rendering.parameters, parameters))) {
          this.rendered = this.rendering.html;
        } else {
          this.rendered = '...';
          this.rendered = await apos.http.post(`${apos.area.action}/render-widget?aposEdit=1&aposMode=draft`, {
            busy: true,
            body: parameters
          });
        }
        // Wait for reactivity to render v-html so that markup is
        // in the DOM before hinting that it might be time to prepare
        // sub-area editors and run players
        setTimeout(function() {
          apos.bus.$emit('widget-rendered');
        }, 0);
      } catch (e) {
        this.rendered = '<p>Unable to render this widget.</p>';
        console.error('Unable to render widget. Possibly the schema has been changed and the existing widget does not pass validation.', e);
      }
    },
    clicked(e) {
      // If you do not want a particular click to swap to the edit view
      // for your widget, you should make sure it does not bubble
      if (this.moduleOptions.contextual) {
        e.stopPropagation();
        e.preventDefault();
        this.$emit('edit');
      }
    }
  }
};
