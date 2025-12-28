"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { useFirebase, useUser } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, type DocumentData } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  FilePlus2,
  FileSearch2,
  ImageUp,
  ImageIcon,
  Loader2,
  LogOut,
  PackagePlus,
  PackageSearch,
  CheckCircle,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut as firebaseSignOut } from "firebase/auth";


type LoadingStates = {
  jobCreate: boolean;
  itemCreate: boolean;
  imageUpload: boolean;
  jobLoad: boolean;
  itemLoad: boolean;
  imageLoad: boolean;
};

export function Wizard() {
  const { user } = useUser();
  const { firestore, auth } = useFirebase();
  const storage = getStorage(auth.app);
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const [loadedJob, setLoadedJob] = useState<DocumentData | null>(null);
  const [loadedItem, setLoadedItem] = useState<DocumentData | null>(null);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState<LoadingStates>({
    jobCreate: false, itemCreate: false, imageUpload: false,
    jobLoad: false, itemLoad: false, imageLoad: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateLoading = (key: keyof LoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Could not sign you out. Please try again.",
      });
    }
  };

  const createJob = async () => {
    if (!user) return;
    updateLoading("jobCreate", true);
    try {
      const newJobId = `job_${user.uid.slice(0,5)}_${Date.now()}`;
      await setDoc(doc(firestore, "jobs", newJobId), {
        title: "Emergency Repair Task",
        createdAt: new Date().toISOString(),
        status: "New",
        assignedTo: user.displayName,
      });
      setJobId(newJobId);
      toast({ title: "Job Created", description: `Job ID: ${newJobId}` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to create job." });
    } finally {
      updateLoading("jobCreate", false);
    }
  };

  const createItem = async () => {
    if (!user) return;
    updateLoading("itemCreate", true);
    try {
        const newItemId = `item_${user.uid.slice(0,5)}_${Date.now()}`;
        await setDoc(doc(firestore, "items", newItemId), {
            name: "Replacement Part",
            sku: `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
            quantity: 10,
            addedBy: user.email
        });
        setItemId(newItemId);
        toast({ title: "Item Created", description: `Item ID: ${newItemId}` });
    } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: "Failed to create inventory item." });
    } finally {
        updateLoading("itemCreate", false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const newImagePath = `images/${user.uid}/${file.name}`;
    const storageRef = ref(storage, newImagePath);
    updateLoading("imageUpload", true);

    try {
        await uploadBytes(storageRef, file);
        setImagePath(newImagePath);
        toast({ title: "Image Uploaded", description: file.name });
    } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: "Failed to upload image." });
    } finally {
        updateLoading("imageUpload", false);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const loadJob = async () => {
    if (!jobId) {
        toast({ variant: "destructive", title: "No Job", description: "Please create a job first." });
        return;
    }
    updateLoading("jobLoad", true);
    try {
        const docRef = doc(firestore, "jobs", jobId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setLoadedJob(docSnap.data());
            toast({ title: "Job Loaded" });
        } else {
            toast({ variant: "destructive", title: "Not Found", description: "Job data not found." });
        }
    } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: "Failed to load job." });
    } finally {
        updateLoading("jobLoad", false);
    }
  };

  const loadItem = async () => {
    if (!itemId) {
        toast({ variant: "destructive", title: "No Item", description: "Please create an item first." });
        return;
    }
    updateLoading("itemLoad", true);
    try {
        const docRef = doc(firestore, "items", itemId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setLoadedItem(docSnap.data());
            toast({ title: "Item Loaded" });
        } else {
            toast({ variant: "destructive", title: "Not Found", description: "Item data not found." });
        }
    } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: "Failed to load item." });
    } finally {
        updateLoading("itemLoad", false);
    }
  };
  
  const loadImage = async () => {
    if (!imagePath) {
        toast({ variant: "destructive", title: "No Image", description: "Please upload an image first." });
        return;
    }
    updateLoading("imageLoad", true);
    try {
        const url = await getDownloadURL(ref(storage, imagePath));
        setLoadedImageUrl(url);
        toast({ title: "Image Loaded" });
    } catch(e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: "Failed to load image." });
    } finally {
        updateLoading("imageLoad", false);
    }
  };
  
  const resetState = () => {
    setStep(1);
    setJobId(null);
    setItemId(null);
    setImagePath(null);
    setLoadedJob(null);
    setLoadedItem(null);
    setLoadedImageUrl(null);
    setFinishDialogOpen(false);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold">1. Create Resources</h3>
            <p className="text-sm text-muted-foreground">Add new jobs, inventory items, and upload related images to Firebase.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
              <Button onClick={createJob} disabled={loading.jobCreate}>
                {loading.jobCreate ? <Loader2 className="animate-spin" /> : <FilePlus2 />} Create Job {jobId && <CheckCircle className="ml-auto text-green-400" />}
              </Button>
              <Button onClick={createItem} disabled={loading.itemCreate}>
                {loading.itemCreate ? <Loader2 className="animate-spin" /> : <PackagePlus />} Create Item {itemId && <CheckCircle className="ml-auto text-green-400" />}
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={loading.imageUpload}>
                {loading.imageUpload ? <Loader2 className="animate-spin" /> : <ImageUp />} Upload Image {imagePath && <CheckCircle className="ml-auto text-green-400" />}
              </Button>
              <Input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold">2. Load Resources</h3>
            <p className="text-sm text-muted-foreground">Retrieve the data you just created from Firebase services.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
              <Button onClick={loadJob} disabled={loading.jobLoad || !jobId}>
                 {loading.jobLoad ? <Loader2 className="animate-spin" /> : <FileSearch2 />} Load Job
              </Button>
              <Button onClick={loadItem} disabled={loading.itemLoad || !itemId}>
                {loading.itemLoad ? <Loader2 className="animate-spin" /> : <PackageSearch />} Load Item
              </Button>
              <Button onClick={loadImage} disabled={loading.imageLoad || !imagePath}>
                {loading.imageLoad ? <Loader2 className="animate-spin" /> : <ImageIcon />} Load Image
              </Button>
            </div>
            <Separator />
            <div className="space-y-4 text-sm">
                {loadedJob && <div className="p-3 bg-background rounded-md border"><h4 className="font-bold">Loaded Job:</h4><pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(loadedJob, null, 2)}</pre></div>}
                {loadedItem && <div className="p-3 bg-background rounded-md border"><h4 className="font-bold">Loaded Item:</h4><pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(loadedItem, null, 2)}</pre></div>}
                {loadedImageUrl && <div className="p-3 bg-background rounded-md border"><h4 className="font-bold">Loaded Image:</h4><Image src={loadedImageUrl} alt="Uploaded content" width={200} height={200} className="mt-2 rounded-md object-cover"/></div>}
            </div>
          </div>
        );
      case 3:
        return (
            <div className="space-y-6 text-center flex flex-col items-center justify-center h-full">
                <CheckCircle className="h-20 w-20 text-green-500" />
                <h3 className="font-headline text-2xl font-semibold">All Steps Completed</h3>
                <p className="text-muted-foreground max-w-xs">You've successfully tested creating and loading resources with Firebase.</p>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl animate-fade-in shadow-xl">
        <CardHeader className="flex flex-row items-center">
            <div className="flex-grow">
                <CardTitle className="font-headline text-2xl">Resmoke Onsite PWA</CardTitle>
                <CardDescription>Steps: {step} of 3</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                     <p className="font-semibold text-sm">{user?.displayName}</p>
                     <p className="text-xs text-muted-foreground">{user?.email}</p>
                 </div>
                 <Avatar>
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={signOut}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="min-h-[350px]">
            {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            {step < 3 ? (
                 <Button onClick={() => setStep(s => s + 1)}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button onClick={() => setFinishDialogOpen(true)}>
                    Finish <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
            )}
        </CardFooter>
      </Card>
      <AlertDialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>All done!</AlertDialogTitle>
            <AlertDialogDescription>
              You have completed all the steps. You can start over to test the process again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetState}>Start Over</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
