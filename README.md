# Einsamkeit <small>(/ˈaɪnzaːmkaɪt/ 孤独)</small>
A lazy ActivityPub Implementation. For single-user, with Node.js.

## 特徴
* 極限までキャッシュされない画像群
* おひとりさまに最適化された(?)構造
* それなりに Mastodon 互換

## Docker で試す
1. `yarn`
2. `docker-compose up -d`
3. `docker-compose exec -u 1000 node npm run server:queue`
