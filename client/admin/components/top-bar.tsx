import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-rows: 48px;
  grid-template-columns: max-content 1fr max-content;
  background-color: #ffa552;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.4));
`;

const Logo = styled.div`
  grid-column: 1;
  margin: 0 10px;
  font-family: 'Playball', serif;
  font-size: 24pt;
  color: #fff;
`;

const RightMenu = styled.div`
  display: flex;
  flex-direction: row;
  grid-column: 3;
`;

const Logout = styled.a`
  height: 48px;
  padding: 0 10px;
  line-height: 48px;
  color: #fff;
  text-decoration: none;
  transition: 0.2s background-color;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

export default () => {
  const csrfMeta: HTMLMetaElement | null = document.querySelector('meta[name=csrf-token]');
  const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') || '' : '';
  const logout = (): void => {
    const logout = document.querySelector('form#logout_form');
    if (logout) (logout as HTMLFormElement).submit();
  };

  return (
    <Container>
      <Logo>Einsamkeit</Logo>
      <RightMenu>
        <Logout href="#">フェイク</Logout>
        <Logout onClick={logout}>ログアウト</Logout>
        <form action="/auth/logout" method="post" id="logout_form">
          <input type="hidden" name="_csrf" value={csrfToken} />
        </form>
      </RightMenu>
    </Container>
  );
};
