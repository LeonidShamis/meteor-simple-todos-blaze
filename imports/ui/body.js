import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Todos } from '../api/todos.js';
 
import './todo.js';
import './body.html';
 
Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('todos');
});
 
Template.body.helpers({
  todos() {
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter todos
      return Todos.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    }
    // Otherwise, return all of the todos
    // Show newest todos at the top
    return Todos.find({}, { sort: { createdAt: -1 } });
  },
  incompleteCount() {
    return Todos.find({ checked: { $ne: true } }).count();
  }
});

 
Template.body.events({
  'submit .new-todo'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const text = target.text.value;
 
    // Insert a todo into the collection
    Meteor.call('todos.insert', text);

    // Clear form
    target.text.value = '';
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
});