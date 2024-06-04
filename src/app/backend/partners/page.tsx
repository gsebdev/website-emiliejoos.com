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

/*const ViewPartner = ({ partner }: { partner: Partner }) => {
    const logoImage = useSelector(selectImageById(Number(partner.logo)))

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-bold text-xs uppercase">Titre</h3>
                <p
                    onDoubleClick={() => store.dispatch(setEditedPartner(partner.id))}
                    className="text-lg font-bold text-primary cursor-pointer"
                >{partner.title}</p>
            </div>
            <div>
                <h3 className="font-bold text-xs uppercase">Lien vers le site web</h3>
                <p
                    onDoubleClick={() => store.dispatch(setEditedPartner(partner.id))}
                    className="cursor-pointer text-primary font-bold"
                >{partner.url}</p>
            </div>
            <div>
                <h3 className="font-bold text-xs uppercase">Logo</h3>
                <ImageInput
                    value={logoImage ?? null}
                    onClick={() => store.dispatch(setEditedPartner(partner.id))}
                />
            </div>
            <div>
                <h3 className="font-bold text-xs uppercase">Description</h3>
                <p
                    className="cursor-pointer text-primary font-bold"
                    onDoubleClick={() => store.dispatch(setEditedPartner(partner.id))}
                >{partner.description}</p>
            </div>
        </div>
    )
}*/

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
                dispatch(setPartner({ ...partner, display_order: index }));
            }
        });
    }, [dispatch])

    return (
        <>
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
                            {/*partnerDialogOpen.editing &&
                                <EditForm
                                    partner={store.getState().partners.items.find((partner) => partner.id === partnerDialogOpen.partner)}
                                    afterSubmit={() => dispatch(partnerDialogOpen.partner ? setViewedPartner(partnerDialogOpen.partner) : setPartnerDialogOpen(false))}
                                    isLoading={partnersStatus === 'loading'}
                                />
                                 :
                                <>
                                    {partnerDialogOpen.partner !== null &&
                                        <ViewPartner
                                            partner={store.getState().partners.items.find((partner) => partner.id === partnerDialogOpen.partner)}
                                        />

                         }
                                    <DialogFooter>
                                        <Button
                                            variant={'outline'}
                                            onClick={() => dispatch(setPartnerDialogOpen(false))}
                                        >
                                            Fermer
                                        </Button>
                                        <Button
                                            onClick={() => dispatch(setEditedPartner(partnerDialogOpen.partner))}
                                        >
                                            Modifier
                                        </Button>
                        </DialogFooter>
                                </> 
                        */}
                        </DialogContent>

                    </Dialog>
                    <Button onClick={() => dispatch(setPartnerDialogOpen(true))}><Plus className="mr-2" /> Ajouter</Button>
                </CardHeader>
                <CardContent className={`transition-opacity duration-500`}>
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
        </>
    )
}