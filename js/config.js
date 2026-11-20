/* 全项目唯一的开发期开关与规模常量。
   上线前必须把 DEV_UNLOCK_ALL 改成 false —— 这是唯一需要人工记得改的地方。 */
window.CONFIG = {
  DEV_UNLOCK_ALL: false,

  /* 数据模型与界面都固定为当前已制作的三海域。 */
  SEA_COUNT: 3,
  PLAYABLE_SEAS: 3,
};
