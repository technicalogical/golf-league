'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface Course {
  id: string;
  name: string;
  par: number;
  location: string | null;
}

interface CourseSelectorProps {
  courses: Course[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CourseSelector({
  courses,
  value,
  onValueChange,
  placeholder = 'Select course...',
}: CourseSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedCourse = courses.find((course) => course.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCourse ? (
            <span className="truncate">
              {selectedCourse.name} (Par {selectedCourse.par})
              {selectedCourse.location && ` - ${selectedCourse.location}`}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search courses..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No course found.</CommandEmpty>
            <CommandGroup>
              {courses
                .filter((course) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    course.name.toLowerCase().includes(query) ||
                    course.location?.toLowerCase().includes(query)
                  );
                })
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((course) => (
                  <CommandItem
                    key={course.id}
                    value={course.id}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === course.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-xs text-gray-500">
                        Par {course.par}
                        {course.location && ` • ${course.location}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
