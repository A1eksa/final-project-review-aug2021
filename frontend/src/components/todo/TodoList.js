import React, { useEffect } from 'react';
import { useSelector, useDispatch, batch } from 'react-redux';

import { IconContext } from 'react-icons';
import { FaCheck } from 'react-icons/fa';
import { FaQuestion } from 'react-icons/fa';
import { API_URL } from '../../utils/constants';
import Swal from 'sweetalert2';
import { EmptyTodo } from '../small components/EmptyTodo';
import deleteIcon from '../../utils/deleteIcon.svg';
import editIcon from '../../utils/editIcon.svg';

import todo from '../../reducers/todo';
import editModal from '../../reducers/editModal';

import {
  H2,
  ListWrapper,
  CardWrapper,
  TodoSubject,
  TodoText,
  Category,
  Label,
  CategoryWrapper,
  BottomContainer,
  LeftWrapper,
  HiddenCheckbox,
  CheckboxContainer,
  CheckboxLabel,
  StyledDeleteButton,
  StyledDeleteIcon,
  StyledEditButton,
  StyledEditIcon,
} from '../todo/_TodoStyles';

export const TodoList = () => {
  const todoItems = useSelector((store) => store.todo.items);
  const accessToken = useSelector((store) => store.user.accessToken);
  const userId = useSelector((store) => store.user.userId);

  const showEditSlideout = (item) => {
    batch(() => {
      dispatch(editModal.actions.setSelectedTodo(item));
      dispatch(editModal.actions.setEditTodoSlideout(true));
    });
  };

  const dispatch = useDispatch();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        Authorization: accessToken,
      },
    };

    fetch(API_URL(`todos/${userId}`), options)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          dispatch(todo.actions.setItems(data.response));
          dispatch(todo.actions.setErrors(null));
        } else {
          dispatch(todo.actions.setItems([]));
          dispatch(todo.actions.setErrors(data.response));
        }
      });
  }, [accessToken, dispatch, userId]);

  const deleteTodo = (todoId) => {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
      body: JSON.stringify({ user: userId }),
    };
    fetch(API_URL(`todos/${todoId}`), options)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Your todo is deleted.',
            confirmButtonColor: 'var(--accent-green)',
            background: 'var(--level-three)',
            color: 'var(--text-primary)',
          }).then(() => {
            dispatch(todo.actions.setErrors(null));
            dispatch(todo.actions.deleteTodo(todoId));
          });
        } else {
          dispatch(todo.actions.setItems([]));
          dispatch(todo.actions.setErrors(data.response));
        }
      });
  };

  const onToggleTodo = (todoId, isCompleted) => {
    const options = {
      method: 'PATCH',
      body: JSON.stringify({
        isCompleted: !isCompleted,
        _id: todoId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    fetch(API_URL(`todo/${todoId}/completed`), options)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          dispatch(todo.actions.toggleTodo(todoId));
          dispatch(todo.actions.setErrors(null));
        } else {
          dispatch(todo.actions.setErrors(data.response));
        }
      });
  };

  if (todoItems.length > 0)
    return (
      <>
        <ListWrapper>
          <H2>Your todos</H2>
          {todoItems &&
            todoItems.map((items) => (
              <CardWrapper key={items._id}>
                <CategoryWrapper>
                  <Label>Category</Label>
                  <Category>{items.category}</Category>
                </CategoryWrapper>
                <TodoSubject>{items.heading}</TodoSubject>
                <TodoText>{items.message}</TodoText>
                <TodoText>Due date {items.dueDate}</TodoText>
                <BottomContainer>
                  <LeftWrapper>
                    <StyledDeleteButton onClick={() => deleteTodo(items._id)}>
                        <StyledDeleteIcon src={deleteIcon}></StyledDeleteIcon>
                      </StyledDeleteButton>
                      <StyledEditButton onClick={() => showEditSlideout(items)}>
                        <StyledEditIcon src={editIcon}></StyledEditIcon>
                      </StyledEditButton>
                  </LeftWrapper>

                  <IconContext.Provider
                    value={{
                      color: 'var(--complete-icon)',
                      size: '14px',
                      style: {
                        verticalAlign: 'middle',
                        marginLeft: '0.05rem',
                      },
                    }}
                  >
                    <CheckboxLabel>
                      Completed
                      {items.isCompleted ? <FaCheck /> : <FaQuestion />}
                      <HiddenCheckbox
                        className='checkbox'
                        name={items._id}
                        id={items._id}
                        type='checkbox'
                        checked={items.isCompleted}
                        onChange={() =>
                          onToggleTodo(items._id, items.isCompleted)
                        }
                      ></HiddenCheckbox>
                      <CheckboxContainer></CheckboxContainer>
                    </CheckboxLabel>
                  </IconContext.Provider>
                </BottomContainer>
              </CardWrapper>
            ))}
        </ListWrapper>
      </>
    );
  return (
    <ListWrapper>
      <H2>Your todos</H2>
      <CardWrapper>
        <EmptyTodo />
      </CardWrapper>
    </ListWrapper>
  );
};
