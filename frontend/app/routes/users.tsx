import UserTable from "~/components/UsersTable";

export default function Users(){
    return <div className="flex justify-center p-4">
        <div className="w-full md:w-1/2">
            <UserTable/>
        </div>
    </div>
}