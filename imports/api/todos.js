import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Todos = new Mongo.Collection('todos');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish todos that are public or belong to the current user
  Meteor.publish('todos', function todosPublication() {
    return Todos.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

Meteor.methods({
  'todos.insert'(text) {
    check(text, String);
 
    // Make sure the user is logged in before inserting a todo
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
 
    Todos.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'todos.remove'(todoId) {
    check(todoId, String);
 
    const todo = Todos.findOne(todoId);
    if (todo.private && todo.owner !== this.userId) {
      // If the todo is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }
 
    Todos.remove(todoId);
  },
  'todos.setChecked'(todoId, setChecked) {
    check(todoId, String);
    check(setChecked, Boolean);
 
    const todo = Todos.findOne(todoId);
    if (todo.private && todo.owner !== this.userId) {
      // If the todo is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }
 
    Todos.update(todoId, { $set: { checked: setChecked } });
  },
  'todos.setPrivate'(todoId, setToPrivate) {
    check(todoId, String);
    check(setToPrivate, Boolean);
 
    const todo = Todos.findOne(todoId);
 
    // Make sure only the todo owner can make a todo private
    if (todo.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
 
    Todos.update(todoId, { $set: { private: setToPrivate } });
  },
});