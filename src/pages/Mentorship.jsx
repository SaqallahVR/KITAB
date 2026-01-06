import React, { useState } from "react";
import { kitabApi } from "@/api/kitabApiClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookMarked, Star, Calendar, ArrowLeft, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Mentorship() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: writers, isLoading } = useQuery({
    queryKey: ['writers'],
    queryFn: () => kitabApi.entities.Writer.filter({ active: true }, '-created_date'),
    initialData: [],
  });

  const filteredWriters = writers.filter(writer => {
    const matchesSearch = writer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         writer.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         writer.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2520] to-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-[#D4AF37]/30">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-[#D4AF37] font-medium">جلسات إرشاد فردية</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              الإرشاد الأدبي
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              احصل على إرشاد شخصي من كتّاب ومرشدين متخصصين، وطوّر موهبتك الكتابية من خلال جلسات فردية
            </p>
            
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="ابحث عن كاتب أو تخصص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-14 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Writers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredWriters.length === 0 ? (
            <Card className="p-12 text-center border-none shadow-lg">
              <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">لم يتم العثور على كتّاب</h3>
              <p className="text-gray-600">جرّب البحث بكلمات مختلفة</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWriters.map((writer) => (
                <Card key={writer.id} className="overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 border-none bg-white group">
                  <div className="relative">
                    <div className="h-64 overflow-hidden bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941F]/20">
                      {writer.image_url ? (
                        <img 
                          src={writer.image_url} 
                          alt={writer.name}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center">
                            <span className="text-5xl font-black text-white">
                              {writer.name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-6 right-6">
                      <Badge className="bg-white text-[#D4AF37] border-[#D4AF37] shadow-lg text-sm px-4 py-2">
                        <BookMarked className="w-4 h-4 ml-1" />
                        {writer.specialty}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pt-10">
                    <CardTitle className="text-2xl text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {writer.name}
                    </CardTitle>
                    {writer.experience && (
                      <p className="text-sm text-gray-600">
                        {writer.experience} خبرة
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                      {writer.bio}
                    </p>
                    
                    {writer.achievements && (
                      <div className="mb-4 p-3 bg-[#F5F1E8] rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {writer.achievements}
                        </p>
                      </div>
                    )}
                    
                    <Link to={createPageUrl("WriterProfile") + "?id=" + writer.id}>
                      <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] group-hover:shadow-xl">
                        <Calendar className="ml-2 w-4 h-4" />
                        حجز جلسة إرشاد
                        <ArrowLeft className="mr-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
