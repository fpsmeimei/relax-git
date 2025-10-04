-- 为用户 002 设置可爱的机器人头像
UPDATE users 
SET avatar = 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=002&backgroundColor=b6e3f4&eyes=bulging,happy&mouth=smile01,smile02&scale=80'
WHERE username = '002';
