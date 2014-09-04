/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Entry = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return '/entries/'+ this.id +'/';
    }
  });

  app.Delete = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/entries/'+ app.mainView.model.id +'/';
    }
  });

  app.Details = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      type: '',
      amount: '',
      description: ''
    },
    url: function() {
      return '/entries/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.entry) {
        app.mainView.model.set(response.entry);
        delete response.entry;
      }

      return response;
    }
  });



  app.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Details();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.model.id,
        amount: app.mainView.model.get('amount'),
        type: app.mainView.model.get('type'),
        description: app.mainView.model.get('description')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
      this.model.save({
        amount: this.$el.find('[name="amount"]').val(),
        type: this.$el.find('[name="type"]').val(),
        description: this.$el.find('[name="description"]').val()
      });
    }
  });



  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.model = new app.Entry( JSON.parse( unescape($('#data-record').html()) ) );

      //app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      //app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
