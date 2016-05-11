/* eslint-env mocha */
 
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
 
import { Todos } from './todos.js';
 
if (Meteor.isServer) {
  describe('Todos', () => {
    describe('methods', () => {
      const userId = Random.id();
      let todoId;
 
      beforeEach(() => {
        Todos.remove({});
        todoId = Todos.insert({
          text: 'test todo',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });
 
      it('can delete owned todo', () => {
        // Find the internal implementation of the todo method so we can
        // test it in isolation
        const deleteTodo = Meteor.server.method_handlers['todos.remove'];
 
        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };
 
        // Run the method with `this` set to the fake invocation
        deleteTodo.apply(invocation, [todoId]);
 
        // Verify that the method does what we expected
        assert.equal(Todos.find().count(), 0);
      });
    });
  });
}