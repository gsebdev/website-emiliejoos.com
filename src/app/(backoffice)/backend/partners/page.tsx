'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/_components/ui/card"


import { fetchPartners, patchParners, selectAllPartners, selectPartnersStatus, setPartner } from "@/app/(backoffice)/_lib/slices/partnersSlice"
import { useDispatch, useSelector } from "react-redux"
import { useCallback, useEffect } from "react"
import { partnersColumns } from "./partners-display-table-columns"
import EditForm from "./partners-edit-form"
import { Button } from "@/app/_components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/_components/ui/dialog"
import DragTable from "@/app/_components/ui/drag-table"
import { PartnerType } from "@/app/_types/definitions"
import { selectPartnerDialog, setEditedPartner, setPartnerDialogOpen } from "@/app/(backoffice)/_lib/slices/userSlice"
import { Plus } from "lucide-react"
import Loader from "@/app/_components/ui/loader"
import { AppDispatch } from "../../_lib/store"


export default function Partners(): React.ReactElement {
    const dispatch = useDispatch<AppDispatch>();
    const partners = useSelector(selectAllPartners);
    const partnersStatus = useSelector(selectPartnersStatus);
    const partnerDialogOpen = useSelector(selectPartnerDialog);

    useEffect(() => {
        dispatch(fetchPartners());
    }, [dispatch]);

    const onReorder = useCallback((newData: PartnerType[]) => {
        const newPartners = newData
            .map(({ id, display_order }, index) => display_order !== index ?
                { id, display_order: index } : null)
            .filter(partner => partner !== null);
        if(newPartners.length === 0) return Promise.resolve();
        return dispatch(patchParners({ partners: newPartners as Partial<PartnerType>[] }));

    }, [dispatch]);

    const selectPartner = useCallback((id: number) => {

        if (partners && Array.isArray(partners)) {
            return partners.find(partner => partner.id === id);
        }

        return null;

    }, [partners])

    return (
        <Card className="overflow-x-auto">
            <CardHeader className="flex-row justify-between flex-wrap">
                <CardTitle>Liste des partenaires</CardTitle>
                <Dialog
                    open={partnerDialogOpen.open}
                    onOpenChange={(open) => dispatch(setPartnerDialogOpen(open))}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">{!partnerDialogOpen.editing ? 'Voir le' : (partnerDialogOpen.partner ? 'Modifier le' : 'Nouveau')} partenaire</DialogTitle>
                        </DialogHeader>
                        <EditForm
                            partner={selectPartner(partnerDialogOpen.partner)}
                            afterSubmit={() => dispatch(setPartnerDialogOpen(false))}
                            isLoading={partnersStatus === 'loading'}
                        />
                    </DialogContent>

                </Dialog>
                <Button onClick={() => dispatch(setPartnerDialogOpen(true))}><Plus className="mr-2" /> Ajouter</Button>
            </CardHeader>
            <CardContent className={`transition-opacity duration-500`}>
                {!partners && ['loading', 'idle'].includes(partnersStatus) && <div className="flex justify-center items-center h-96"><Loader /></div>}
                {!!partners && partners.length > 0 &&
                    <DragTable
                        columns={partnersColumns}
                        rows={partners}
                        onReorder={onReorder}
                        onRowDoubleClick={(partner) => dispatch(setEditedPartner(partner.id))}
                        orderAccessorKey="display_order" />
                }
            </CardContent>
        </Card>
    )
}