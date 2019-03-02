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
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

function callLogout() {}

export default () => {
  const csrfMeta: HTMLMetaElement | null = document.querySelector('meta[name=csrf-token]');
  const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') || '' : '';
  return (
    <Container>
      <Logo>Einsamkeit</Logo>
      <RightMenu>
        <Logout href="#">フェイク</Logout>
        <form action="/auth/logout" method="post">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <Logout>ログアウト</Logout>
        </form>
      </RightMenu>
    </Container>
  );
};
