 SELECT qy_account.safecode, qy_role.* FROM qy_account, qy_role WHERE qy_role.roleid = 157842 and qy_account.accountid = qy_role.accountid;

INSERT INTO dhxy_mount (roleid,resid) VALUES (157842,9111);
SELECT * FROM dhxy_mount;
DELETE FROM dhxy_mount;