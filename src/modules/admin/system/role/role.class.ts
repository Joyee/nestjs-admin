import { ApiProperty } from '@nestjs/swagger';
import SysRole from '@/entities/admin/sys-role.entity';
import SysRoleMenu from '@/entities/admin/sys-role-menu.entity';
import SysRoleDepartment from '@/entities/admin/sys-role-department.entity';

export class RoleInfo {
  @ApiProperty({ type: SysRole })
  roleInfo: SysRole;

  @ApiProperty({ type: [SysRoleMenu] })
  menus: SysRoleMenu[];

  @ApiProperty({ type: [SysRoleDepartment] })
  depts: SysRoleDepartment[];
}

export class CreatedRoleId {
  roleId: number;
}
