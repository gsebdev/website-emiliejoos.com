'use client'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


import { fetchPartners, selectAllPartners, selectPartnersStatus, setPartner } from "@/lib/slices/partnersSlice"
import { useDispatch, useSelector } from "react-redux"
import { useCallback, useEffect } from "react"
import { store } from "@/store"
import { partnersColumns } from "./partners-display-table-columns"
import EditForm from "./partners-edit-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DragTable from "@/components/ui/drag-table"
import { Partner } from "@/lib/definitions"
import { selectPartnerDialog, setEditedPartner, setPartnerDialogOpen } from "@/lib/slices/userSlice"
import { Plus } from "lucide-react"
import Loader from "@/components/ui/loader"


export default function Partners(): React.ReactElement {
    const dispatch = useDispatch<typeof store.dispatch>();
    const partners = useSelector(selectAllPartners);
    const partnersStatus = useSelector(selectPartnersStatus);
    const partnerDialogOpen = useSelector(selectPartnerDialog);

    useEffect(() => {
        if (partnersStatus === 'idle') {
            dispatch(fetchPartners());
        }
    }, [dispatch, partnersStatus]);

    const onReorder = useCallback((newData: Partner[]) => {
        newData.forEach((partner, index) => {
            if (partner.display_order !== index) {
                dispatch(setPartner({
                    partner: {
                        ...partner,
                        display_order: index
                    },
                    notification: false
                }));
            }
        });
    }, [dispatch])

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
                            partner={store.getState().partners.items.find((partner) => partner.id === partnerDialogOpen.partner)}
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