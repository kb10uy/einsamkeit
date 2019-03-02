import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr max-content;
  grid-template-rows: 48px;
  background-color: #ffa552;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.4));
`;

const Logo = styled.div`
  font-family: 'Playball';
  color: #fff;
  grid-column: 1;
  font-size: 24pt;
  margin: 0 10px;
`;

const RightMenu = styled.div`
  grid-column: 3;
  display: flex;
  flex-direction: row;
`;

const Logout = styled.a`
  height: 48px;
  line-height: 48px;
  transition: 0.2s background-color;
  color: #fff;
  padding: 0 10px;
  text-decoration: none;
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

export default () => {
  const csrfMeta: HTMLMetaElement | null = document.querySelector('meta[name=csrf-token]');
  const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') || '' : '';
  const logout = () => {
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
