import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Typography from "@mui/material/Typography";
import Home from '@mui/icons-material/Home';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AppsIcon from '@mui/icons-material/Apps';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Settings from '@mui/icons-material/Settings';
import { usePathname } from 'next/navigation';

function MyBottomNavigation(): JSX.Element {
    const pathname = usePathname()

    return (
        <BottomNavigation
            value={pathname}
            showLabels
        >
            <BottomNavigationAction
                label={<Typography variant="body2" sx={{ fontSize: "10px" }}>商品登録</Typography>}
                value="/registration"
                icon={<AppRegistrationIcon />}
                component="a"
                href="/registration"
            />

            <BottomNavigationAction
                label={<Typography variant="body2" sx={{ fontSize: "10px" }}>商品一覧</Typography>}
                value="/product"
                icon={<AppsIcon />}
                component="a"
                href="/product"
            />

            <BottomNavigationAction
                label={<Typography variant="body2" sx={{ fontSize: "10px" }}>ホーム</Typography>}
                value="/"
                icon={<Home />}
                component="a"
                href="/"
            />

            <BottomNavigationAction
                label={<Typography variant="body2" sx={{ fontSize: "10px" }}>注文情報</Typography>}
                value="/order"
                icon={<ShoppingCartIcon />}
                component="a"
                href="/order"
            />

            <BottomNavigationAction
                label={<Typography variant="body2" sx={{ fontSize: "10px" }}>設定</Typography>}
                value="/settings"
                icon={<Settings />}
                component="a"
                href="/settings"
            />
        </BottomNavigation>
    );
}

export default MyBottomNavigation;
