import UpdateUserDialog from '../../dialogs/UpdateUserDialog'
import DeleteUserDialog from '../../dialogs/DeleteUserDialog'

export const UserColumns: any = (handleUpdateUser: any, handleDeleteUser: any) => [
  {
    header: 'Username',
    accessorKey: 'user_name'
  },
  {
    header: 'Password',
    accessorKey: 'password'
  },
  {
    header: 'Role',
    accessorKey: 'role'
  },
  {
    header: 'Action',
    Cell: ({ cell }: any) => {
      const userDetails = cell.row.original

      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          {/* Update user dialog */}
          <UpdateUserDialog userDetails={userDetails} handleUpdateUser={handleUpdateUser} />
          {/* Delete user dialog */}
          <DeleteUserDialog userDetails={userDetails} handleDeleteUser={handleDeleteUser} />
        </div>
      )
    }
  }
]
