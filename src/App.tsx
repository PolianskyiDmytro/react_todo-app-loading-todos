/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { addTodo, getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { TodoElement } from './Todo';
import { UserWarning } from './UserWarning';
import classNames from 'classnames';

type FilterStatus = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const todoInput = useRef<HTMLInputElement>(null);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [showedTodos, setShowedTodos] = useState<Todo[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const itemsLeft = activeTodos.length;

  const handleAll = () => {
    setShowedTodos(todos);
    setFilterStatus('all');
  };

  const handleActive = () => {
    setShowedTodos(activeTodos);
    setFilterStatus('active');
  };

  const handleCompleted = () => {
    setShowedTodos(completedTodos);
    setFilterStatus('completed');
  };

  const handleFocus = () => {
    if (todoInput.current) {
      todoInput.current.focus();
    }
  };

  const hideError = () => {
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  useEffect(() => {
    setLoading(true);

    getTodos()
      .then(result => {
        setTodos(result);
        setShowedTodos(result);
      })
      .catch(error => {
        setErrorMessage('Unable to load todos');
        hideError();
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });

    handleFocus();
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (title.trim().length > 0) {
      setLoading(true);

      addTodo(title.trim())
        .then((response: Todo) => {
          setTodos([...todos, response]);
          if (todoInput.current) {
            todoInput.current.value = '';
          }
        })
        .catch(error => {
          setErrorMessage('Unable to add a todo');
          handleFocus();
          hideError();
          throw error;
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setErrorMessage('Title should not be empty');
      hideError();
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setErrorMessage('');
  };

  const handleRemoveError = () => {
    setErrorMessage('');

    handleFocus();
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              ref={todoInput}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={event => handleTitleChange(event.target.value)}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {/* This is a completed todo */}
          {showedTodos.map(todo => (
            <TodoElement key={todo.id} todo={todo} loading={loading} />
          ))}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length !== 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {itemsLeft} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={classNames('filter__link', {
                  selected: filterStatus === 'all',
                })}
                data-cy="FilterLinkAll"
                onClick={handleAll}
              >
                All
              </a>

              <a
                href="#/active"
                className={classNames('filter__link', {
                  selected: filterStatus === 'active',
                })}
                data-cy="FilterLinkActive"
                onClick={handleActive}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={classNames('filter__link', {
                  selected: filterStatus === 'completed',
                })}
                data-cy="FilterLinkCompleted"
                onClick={handleCompleted}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={handleRemoveError}
        />
        {/* show only one message at a time */}
        {errorMessage}
      </div>
    </div>
  );
};
