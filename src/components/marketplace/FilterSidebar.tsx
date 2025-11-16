import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
export function FilterSidebar() {
  return (
    <aside className="w-full lg:w-64 xl:w-72">
      <h2 className="text-2xl font-bold mb-6">Filters</h2>
      <Accordion type="multiple" defaultValue={['categories', 'price']} className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger className="text-lg font-semibold">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {MOCK_CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox id={category.slug} />
                  <Label htmlFor={category.slug} className="font-normal text-base">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-semibold">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <Slider
                defaultValue={[0, 500]}
                max={1000}
                step={10}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$1000</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="rating">
          <AccordionTrigger className="text-lg font-semibold">Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="font-normal text-base">
                    {rating} Stars & Up
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}