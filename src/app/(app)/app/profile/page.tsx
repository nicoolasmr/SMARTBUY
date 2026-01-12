import { getHouseholdProfile } from "@/lib/app/actions";
import { ProfileForm } from "./profile-form";
import { Card } from "@/components/ui/card";

export default async function ProfilePage() {
    const { data: profile } = await getHouseholdProfile();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Perfil do Household</h1>
                <p className="text-muted-foreground">
                    Defina as regras gerais de consumo para sua casa.
                </p>
            </div>

            <Card className="p-6">
                <ProfileForm initialData={profile} />
            </Card>
        </div>
    );
}
