import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router";

export function BackButton() {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    return (
        <div
            onClick={handleBack}
            className="cursor-pointer text-2xl hover:text-blue-500"
        >
            <BiArrowBack />
        </div>
    );
}